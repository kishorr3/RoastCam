import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  EmotionScores,
  EmotionType,
  FaceDetectionResult,
  FingerCount,
  HandLandmarks,
  MouthDetectionResult,
  MouthStateType,
  MultimodalState,
  Point2D,
} from '../types';

export type TrackerModelStatus = 'initializing' | 'mediapipe' | 'optical-fallback' | 'simulated';

let faceLandmarkerInstance: FaceLandmarker | null = null;
let handLandmarkerInstance: HandLandmarker | null = null;
let isInitializingMediaPipe = false;
let initError = false;

// Fallback offscreen canvas for optical pixel analysis
let fallbackCanvas: HTMLCanvasElement | null = null;
let fallbackCtx: CanvasRenderingContext2D | null = null;

// Running smoothed emotion scores to prevent frame-to-frame jitter
const smoothedScores: EmotionScores = {
  Happy: 0.05,
  Sad: 0.03,
  Angry: 0.03,
  Neutral: 0.8,
  Surprise: 0.03,
  Fear: 0.03,
  Disgust: 0.03,
};

// Running smoothed mouth ratio
let smoothedMouthRatio = 0.12;

/**
 * Initialize MediaPipe Vision models with fallback to CPU if GPU fails
 */
export async function initMediaPipeVision(): Promise<boolean> {
  if (faceLandmarkerInstance && handLandmarkerInstance) {
    return true;
  }
  if (isInitializingMediaPipe) {
    return false;
  }

  isInitializingMediaPipe = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    // Try GPU first, then CPU
    const createFace = async (delegate: 'GPU' | 'CPU') => {
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate,
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    };

    const createHand = async (delegate: 'GPU' | 'CPU') => {
      return HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate,
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });
    };

    try {
      faceLandmarkerInstance = await createFace('GPU');
    } catch {
      faceLandmarkerInstance = await createFace('CPU');
    }

    try {
      handLandmarkerInstance = await createHand('GPU');
    } catch {
      handLandmarkerInstance = await createHand('CPU');
    }

    isInitializingMediaPipe = false;
    return true;
  } catch (err) {
    console.warn('MediaPipe initialization warning (using optical fallback):', err);
    initError = true;
    isInitializingMediaPipe = false;
    return false;
  }
}

export function getTrackerStatus(): TrackerModelStatus {
  if (faceLandmarkerInstance && handLandmarkerInstance) return 'mediapipe';
  if (isInitializingMediaPipe) return 'initializing';
  if (initError) return 'optical-fallback';
  return 'initializing';
}

/**
 * Main inference executor for each video frame
 */
export function analyzeVideoFrame(
  video: HTMLVideoElement,
  timestampMs: number,
  sensitivity: 'normal' | 'high' | 'ultra' = 'high'
): {
  state: MultimodalState;
  modelStatus: TrackerModelStatus;
} {
  // Check if video is playing and has data
  if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return {
      state: createDefaultState(),
      modelStatus: getTrackerStatus(),
    };
  }

  // Multiplier based on sensitivity setting
  const sensMult = sensitivity === 'ultra' ? 1.6 : sensitivity === 'high' ? 1.3 : 1.0;

  // 1. Try MediaPipe if ready
  if (faceLandmarkerInstance) {
    try {
      const faceResult = faceLandmarkerInstance.detectForVideo(video, timestampMs);
      let handLandmarksResult: HandLandmarks | null = null;

      if (handLandmarkerInstance) {
        try {
          const handResult = handLandmarkerInstance.detectForVideo(video, timestampMs);
          if (handResult.landmarks && handResult.landmarks.length > 0) {
            const rawPoints = handResult.landmarks[0];
            const handedness = (handResult.handedness?.[0]?.[0]?.categoryName as 'Left' | 'Right') || 'Right';
            handLandmarksResult = parseHandLandmarks(rawPoints, handedness);
          }
        } catch (e) {
          console.debug('Hand tracking tick skip:', e);
        }
      }

      // If a face is found by MediaPipe
      if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
        const landmarks = faceResult.faceLandmarks[0];
        const blendshapes = faceResult.faceBlendshapes?.[0]?.categories || [];

        // Build category map for quick lookup
        const bMap: Record<string, number> = {};
        for (let i = 0; i < blendshapes.length; i++) {
          bMap[blendshapes[i].categoryName] = blendshapes[i].score;
        }

        // Bounding box from min/max coordinates
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (let i = 0; i < landmarks.length; i++) {
          const pt = landmarks[i];
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }
        // Add small padding
        const padX = (maxX - minX) * 0.08;
        const padY = (maxY - minY) * 0.08;
        const faceBox = {
          x: Math.max(0, minX - padX),
          y: Math.max(0, minY - padY),
          width: Math.min(1 - minX, maxX - minX + padX * 2),
          height: Math.min(1 - minY, maxY - minY + padY * 2),
        };

        // Derive Mouth Aperture using upper/lower lip landmarks and jawOpen blendshape
        // Landmark 13: upper lip, Landmark 14: lower lip
        // Landmark 61: left corner, Landmark 291: right corner
        const p13 = landmarks[13];
        const p14 = landmarks[14];
        const p61 = landmarks[61];
        const p291 = landmarks[291];

        let mouthRatio = 0.1;
        if (p13 && p14 && p61 && p291) {
          const vDist = Math.hypot(p13.x - p14.x, p13.y - p14.y);
          const hDist = Math.hypot(p61.x - p291.x, p61.y - p291.y) || 0.01;
          mouthRatio = vDist / hDist;
        }
        const jawOpen = bMap['jawOpen'] || 0;
        // Combine landmark distance with blendshape
        const combinedMouthRatio = Math.max(mouthRatio, jawOpen * 0.85);

        // Smooth mouth ratio
        smoothedMouthRatio = smoothedMouthRatio * 0.65 + combinedMouthRatio * 0.35;

        let mouthState: MouthStateType = 'Closed';
        if (smoothedMouthRatio >= 0.42 || jawOpen >= 0.48) {
          mouthState = 'Wide Open';
        } else if (smoothedMouthRatio >= 0.18 || jawOpen >= 0.18) {
          mouthState = 'Slightly Open';
        } else {
          mouthState = 'Closed';
        }

        // Calculate Expression Probabilities with responsive thresholds
        const smileLeft = bMap['mouthSmileLeft'] || 0;
        const smileRight = bMap['mouthSmileRight'] || 0;
        const avgSmile = ((smileLeft + smileRight) / 2) * sensMult;

        const jaw = (bMap['jawOpen'] || 0) * sensMult;
        const eyeWideLeft = bMap['eyeWideLeft'] || 0;
        const eyeWideRight = bMap['eyeWideRight'] || 0;
        const avgEyeWide = (eyeWideLeft + eyeWideRight) / 2;

        const browOuterUpLeft = bMap['browOuterUpLeft'] || 0;
        const browOuterUpRight = bMap['browOuterUpRight'] || 0;
        const avgBrowOuterUp = (browOuterUpLeft + browOuterUpRight) / 2;

        const browDownLeft = bMap['browDownLeft'] || 0;
        const browDownRight = bMap['browDownRight'] || 0;
        const avgBrowDown = ((browDownLeft + browDownRight) / 2) * sensMult;

        const browInnerUp = (bMap['browInnerUp'] || 0) * sensMult;
        const mouthFrownLeft = bMap['mouthFrownLeft'] || 0;
        const mouthFrownRight = bMap['mouthFrownRight'] || 0;
        const avgMouthFrown = ((mouthFrownLeft + mouthFrownRight) / 2) * sensMult;

        const noseSneerLeft = bMap['noseSneerLeft'] || 0;
        const noseSneerRight = bMap['noseSneerRight'] || 0;
        const avgNoseSneer = (noseSneerLeft + noseSneerRight) / 2;
        const mouthPucker = bMap['mouthPucker'] || 0;

        // Raw Emotion Strengths:
        // Happy: strong response even on subtle smile (> 0.20)
        let rawHappy = avgSmile > 0.15 ? Math.min(1.0, (avgSmile - 0.12) * 2.2) : 0.02;

        // Surprise: jaw drop + wide eyes / raised outer brows
        let rawSurprise =
          jaw > 0.25 || (avgEyeWide > 0.25 && avgBrowOuterUp > 0.2)
            ? Math.min(1.0, jaw * 0.6 + avgEyeWide * 0.5 + avgBrowOuterUp * 0.4)
            : 0.02;

        // Sad: inner eyebrows raised + mouth frowning, without smile
        let rawSad =
          (browInnerUp > 0.22 || avgMouthFrown > 0.18) && avgSmile < 0.2
            ? Math.min(1.0, browInnerUp * 0.7 + avgMouthFrown * 0.5)
            : 0.02;

        // Angry: eyebrows furrowed down + nose sneer
        let rawAngry =
          avgBrowDown > 0.22 ? Math.min(1.0, avgBrowDown * 0.9 + avgNoseSneer * 0.4) : 0.02;

        // Disgust: nose sneer + mouth pucker or upper lip raised
        let rawDisgust =
          avgNoseSneer > 0.2 || mouthPucker > 0.3
            ? Math.min(1.0, avgNoseSneer * 0.7 + mouthPucker * 0.5)
            : 0.02;

        // Fear: wide eyes + inner brow up + furrow
        let rawFear =
          avgEyeWide > 0.28 && browInnerUp > 0.22
            ? Math.min(1.0, avgEyeWide * 0.6 + browInnerUp * 0.6)
            : 0.02;

        // Non-neutral aggregate
        const nonNeutralSum =
          rawHappy * 1.5 +
          rawSurprise * 1.4 +
          rawSad * 1.3 +
          rawAngry * 1.3 +
          rawDisgust * 1.2 +
          rawFear * 1.2;

        // Neutral baseline
        let rawNeutral = Math.max(0.08, 1.0 - nonNeutralSum);

        // Softmax / normalization
        const sumTotal =
          rawHappy + rawSurprise + rawSad + rawAngry + rawDisgust + rawFear + rawNeutral;
        rawHappy /= sumTotal;
        rawSurprise /= sumTotal;
        rawSad /= sumTotal;
        rawAngry /= sumTotal;
        rawDisgust /= sumTotal;
        rawFear /= sumTotal;
        rawNeutral /= sumTotal;

        // Smooth with EMA filter (alpha 0.4 for rapid 100ms response without flicker)
        const alpha = 0.4;
        smoothedScores.Happy = smoothedScores.Happy * (1 - alpha) + rawHappy * alpha;
        smoothedScores.Surprise = smoothedScores.Surprise * (1 - alpha) + rawSurprise * alpha;
        smoothedScores.Sad = smoothedScores.Sad * (1 - alpha) + rawSad * alpha;
        smoothedScores.Angry = smoothedScores.Angry * (1 - alpha) + rawAngry * alpha;
        smoothedScores.Disgust = smoothedScores.Disgust * (1 - alpha) + rawDisgust * alpha;
        smoothedScores.Fear = smoothedScores.Fear * (1 - alpha) + rawFear * alpha;
        smoothedScores.Neutral = smoothedScores.Neutral * (1 - alpha) + rawNeutral * alpha;

        // Find dominant emotion
        let dominant: EmotionType = 'Neutral';
        let maxScore = smoothedScores.Neutral;

        const emotionsToCheck: EmotionType[] = [
          'Happy',
          'Surprise',
          'Sad',
          'Angry',
          'Disgust',
          'Fear',
        ];
        // Give expressive emotions a fair threshold (> 0.22) to conquer Neutral
        for (const emo of emotionsToCheck) {
          if (smoothedScores[emo] > maxScore && smoothedScores[emo] > 0.22) {
            maxScore = smoothedScores[emo];
            dominant = emo;
          }
        }

        const faceResultPayload: FaceDetectionResult = {
          box: faceBox,
          emotions: { ...smoothedScores },
          dominantEmotion: dominant,
          confidence: Math.min(0.98, Math.max(0.72, maxScore + 0.1)),
        };

        const mouthResultPayload: MouthDetectionResult = {
          state: mouthState,
          ratio: smoothedMouthRatio,
        };

        return {
          state: {
            face: faceResultPayload,
            hand: handLandmarksResult,
            mouth: mouthResultPayload,
            timestamp: Date.now(),
          },
          modelStatus: 'mediapipe',
        };
      }
    } catch (err) {
      console.warn('MediaPipe frame detection error, falling back:', err);
    }
  }

  // 2. Optical Computer Vision Fallback (Instant, Zero-Lag, In-Browser)
  return runOpticalFallback(video, sensMult);
}

/**
 * Parses 21 3D landmarks into HandLandmarks and determines finger raised states
 */
function parseHandLandmarks(
  rawPoints: { x: number; y: number; z?: number }[],
  handedness: 'Left' | 'Right'
): HandLandmarks {
  const points: Point2D[] = rawPoints.map((p) => ({ x: p.x, y: p.y }));

  // MediaPipe Landmark Indices:
  // Wrist = 0
  // Thumb: 1, 2, 3, 4
  // Index: 5, 6, 7, 8
  // Middle: 9, 10, 11, 12
  // Ring: 13, 14, 15, 16
  // Pinky: 17, 18, 19, 20

  const wrist = points[0];
  const thumbTip = points[4];
  const thumbIp = points[3];
  const thumbMcp = points[2];
  const pinkyMcp = points[17];

  const indexTip = points[8];
  const indexPip = points[6];
  const indexMcp = points[5];

  const middleTip = points[12];
  const middlePip = points[10];

  const ringTip = points[16];
  const ringPip = points[14];

  const pinkyTip = points[20];
  const pinkyPip = points[18];

  const dist = (p1: Point2D, p2: Point2D) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // For Index, Middle, Ring, Pinky:
  // A finger is raised if tip is farther from wrist than PIP joint, or tip Y is distinctly above PIP
  const isFingerUp = (tip: Point2D, pip: Point2D, mcp: Point2D) => {
    const tipDist = dist(wrist, tip);
    const pipDist = dist(wrist, pip);
    // Either vertical elevation or radial extension
    return tip.y < pip.y || tipDist > pipDist * 1.15;
  };

  const indexUp = isFingerUp(indexTip, indexPip, indexMcp);
  const middleUp = isFingerUp(middleTip, middlePip, points[9]);
  const ringUp = isFingerUp(ringTip, ringPip, points[13]);
  const pinkyUp = isFingerUp(pinkyTip, pinkyPip, pinkyMcp);

  // For Thumb:
  // Compare distance to pinky base or extension outward from wrist
  const thumbDistWrist = dist(wrist, thumbTip);
  const thumbIpDistWrist = dist(wrist, thumbIp);
  const thumbToPinky = dist(thumbTip, pinkyMcp);
  const thumbIpToPinky = dist(thumbIp, pinkyMcp);

  const thumbUp =
    thumbDistWrist > thumbIpDistWrist * 1.12 &&
    (thumbToPinky > thumbIpToPinky * 1.05 || thumbTip.y < thumbMcp.y);

  const raised = [thumbUp, indexUp, middleUp, ringUp, pinkyUp];
  const count = raised.filter(Boolean).length as FingerCount;

  return {
    points,
    fingerCount: count,
    handedness,
    raisedFingers: raised,
  };
}

/**
 * Optical fallback analyzer: Samples video pixels on an offscreen canvas
 * Analyzes skin tone, mouth region luminosity/contrast, and hand blobs.
 */
function runOpticalFallback(
  video: HTMLVideoElement,
  sensMult: number
): {
  state: MultimodalState;
  modelStatus: TrackerModelStatus;
} {
  if (!fallbackCanvas) {
    fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 160;
    fallbackCanvas.height = 120;
    fallbackCtx = fallbackCanvas.getContext('2d', { willReadFrequently: true });
  }

  const ctx = fallbackCtx;
  if (!ctx) {
    return { state: createDefaultState(), modelStatus: 'optical-fallback' };
  }

  // Draw scaled video frame
  ctx.drawImage(video, 0, 0, 160, 120);
  const imgData = ctx.getImageData(0, 0, 160, 120);
  const d = imgData.data;

  // 1. Locate Face Bounding Box via Skin Chrominance
  let skinCount = 0;
  let sumX = 0;
  let sumY = 0;
  let minX = 160, maxX = 0, minY = 120, maxY = 0;

  for (let y = 10; y < 100; y += 2) {
    for (let x = 20; x < 140; x += 2) {
      const idx = (y * 160 + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];

      // Skin detection heuristic
      if (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 15 &&
        Math.abs(r - g) > 10
      ) {
        skinCount++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If face detected
  let faceBox = { x: 0.35, y: 0.18, width: 0.3, height: 0.44 };
  let isFacePresent = skinCount > 200;

  if (isFacePresent) {
    const avgX = sumX / skinCount / 160;
    const avgY = sumY / skinCount / 120;
    const bw = Math.max(0.24, (maxX - minX) / 160);
    const bh = Math.max(0.32, (maxY - minY) / 120);
    faceBox = {
      x: Math.max(0.1, avgX - bw / 2),
      y: Math.max(0.1, avgY - bh / 2),
      width: Math.min(0.8, bw),
      height: Math.min(0.8, bh),
    };
  }

  // 2. Optical Mouth Analysis: Look at bottom 35% of faceBox
  const mouthTopPx = Math.floor((faceBox.y + faceBox.height * 0.65) * 120);
  const mouthBottomPx = Math.floor((faceBox.y + faceBox.height * 0.95) * 120);
  const mouthLeftPx = Math.floor((faceBox.x + faceBox.width * 0.25) * 160);
  const mouthRightPx = Math.floor((faceBox.x + faceBox.width * 0.75) * 160);

  let darkPixelCount = 0;
  let redLipCount = 0;
  let sampleCount = 0;

  for (let y = mouthTopPx; y < mouthBottomPx; y++) {
    for (let x = mouthLeftPx; x < mouthRightPx; x++) {
      if (x < 0 || x >= 160 || y < 0 || y >= 120) continue;
      const idx = (y * 160 + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];
      const lum = (r + g + b) / 3;

      sampleCount++;
      // Dark cavity inside open mouth
      if (lum < 55) {
        darkPixelCount++;
      }
      // Smile corners / lips
      if (r > g + 25 && r > b + 25) {
        redLipCount++;
      }
    }
  }

  const darkRatio = sampleCount > 0 ? (darkPixelCount / sampleCount) * 10 : 0.1;
  const redRatio = sampleCount > 0 ? redLipCount / sampleCount : 0.2;

  // Mouth State
  let mouthState: MouthStateType = 'Closed';
  let ratio = Math.min(1.0, darkRatio * 1.5 + 0.1);
  if (darkRatio > 0.45) {
    mouthState = 'Wide Open';
  } else if (darkRatio > 0.18) {
    mouthState = 'Slightly Open';
  }

  // Smile metric: higher redness / width ratio
  const smileScore = Math.min(1.0, redRatio * 3.5 * sensMult);

  let dominant: EmotionType = 'Neutral';
  if (mouthState === 'Wide Open') {
    dominant = 'Surprise';
  } else if (smileScore > 0.45) {
    dominant = 'Happy';
  } else if (darkRatio < 0.05 && isFacePresent) {
    dominant = 'Neutral';
  }

  // Check for hand in lower right quadrant
  let handSkinPixels = 0;
  let handSumX = 0;
  let handSumY = 0;
  for (let y = 70; y < 118; y += 2) {
    for (let x = 90; x < 155; x += 2) {
      const idx = (y * 160 + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];
      if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
        handSkinPixels++;
        handSumX += x;
        handSumY += y;
      }
    }
  }

  let hand: HandLandmarks | null = null;
  if (handSkinPixels > 90) {
    // Generate simulated hand at detected centroid
    const hx = handSumX / handSkinPixels / 160;
    const hy = handSumY / handSkinPixels / 120;
    hand = {
      points: [{ x: hx, y: hy }],
      fingerCount: 2,
      handedness: 'Right',
      raisedFingers: [false, true, true, false, false],
    };
  }

  return {
    state: {
      face: {
        box: faceBox,
        emotions: {
          Happy: dominant === 'Happy' ? 0.85 : 0.05,
          Sad: 0.03,
          Angry: 0.03,
          Neutral: dominant === 'Neutral' ? 0.8 : 0.08,
          Surprise: dominant === 'Surprise' ? 0.88 : 0.04,
          Fear: 0.02,
          Disgust: 0.02,
        },
        dominantEmotion: dominant,
        confidence: isFacePresent ? 0.88 : 0.4,
      },
      hand,
      mouth: {
        state: mouthState,
        ratio,
      },
      timestamp: Date.now(),
    },
    modelStatus: isFacePresent ? 'optical-fallback' : 'initializing',
  };
}

function createDefaultState(): MultimodalState {
  return {
    face: {
      box: { x: 0.35, y: 0.18, width: 0.3, height: 0.44 },
      emotions: {
        Happy: 0.1,
        Sad: 0.05,
        Angry: 0.05,
        Neutral: 0.7,
        Surprise: 0.04,
        Fear: 0.03,
        Disgust: 0.03,
      },
      dominantEmotion: 'Neutral',
      confidence: 0.5,
    },
    hand: null,
    mouth: {
      state: 'Closed',
      ratio: 0.12,
    },
    timestamp: Date.now(),
  };
}
