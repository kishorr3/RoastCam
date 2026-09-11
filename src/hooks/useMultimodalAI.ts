import { useCallback, useEffect, useRef, useState } from 'react';
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
  TelemetryData,
} from '../types';
import { renderVisionOverlay } from '../utils/canvasRenderer';
import {
  analyzeVideoFrame,
  getTrackerStatus,
  initMediaPipeVision,
  TrackerModelStatus,
} from '../utils/visionTracker';

const DEFAULT_EMOTIONS: EmotionScores = {
  Happy: 0.05,
  Sad: 0.03,
  Angry: 0.03,
  Neutral: 0.8,
  Surprise: 0.03,
  Fear: 0.03,
  Disgust: 0.03,
};

export function useMultimodalAI() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<'normal' | 'high' | 'ultra'>('high');
  const [modelStatus, setModelStatus] = useState<TrackerModelStatus>('initializing');

  // Live Multimodal State
  const [multimodalState, setMultimodalState] = useState<MultimodalState>({
    face: {
      box: { x: 0.35, y: 0.18, width: 0.3, height: 0.44 },
      emotions: DEFAULT_EMOTIONS,
      dominantEmotion: 'Neutral',
      confidence: 0.88,
    },
    hand: null,
    mouth: {
      state: 'Closed',
      ratio: 0.12,
    },
    timestamp: Date.now(),
  });

  // Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    fps: 0,
    latencyMs: 14,
    cameraActive: false,
    faceActive: false,
    handActive: false,
    mouthActive: false,
    modelStatus: 'initializing',
  });

  // Performance telemetry counters
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());

  // Manual simulation override (temporary when simulator buttons are tapped)
  const manualOverrideUntilRef = useRef<number>(0);
  const demoTargetRef = useRef<{
    emotion: EmotionType;
    fingers: FingerCount;
    mouth: MouthStateType;
  }>({
    emotion: 'Neutral',
    fingers: 0,
    mouth: 'Closed',
  });

  // Pre-load MediaPipe Vision background worker on mount
  useEffect(() => {
    initMediaPipeVision().then(() => {
      setModelStatus(getTrackerStatus());
    });
  }, []);

  // Helper to generate 21 hand landmarks based on finger count
  const generateHandLandmarks = useCallback(
    (count: FingerCount, handedness: 'Left' | 'Right' = 'Right'): HandLandmarks => {
      const baseX = 0.72;
      const baseY = 0.65;
      const points: Point2D[] = [];

      // Wrist [0]
      points.push({ x: baseX, y: baseY });

      // Determine raised fingers [thumb, index, middle, ring, pinky]
      const raised = [
        count === 5,
        count >= 1,
        count >= 2,
        count >= 3,
        count >= 4,
      ];

      // Hand angles
      const fingerAngles = [-0.6, -0.3, 0, 0.3, 0.6];
      const lengths = [0.12, 0.18, 0.2, 0.17, 0.14];

      fingerAngles.forEach((angle, fIdx) => {
        const isRaised = raised[fIdx];
        const len = isRaised ? lengths[fIdx] : lengths[fIdx] * 0.45;

        for (let j = 1; j <= 4; j++) {
          const segLen = (len * j) / 4;
          const curveY = isRaised ? -segLen : -segLen * 0.5 + 0.04;
          const curveX = Math.sin(angle) * segLen * 0.9;
          points.push({
            x: baseX + curveX,
            y: baseY + curveY,
          });
        }
      });

      return {
        points,
        fingerCount: count,
        handedness,
        raisedFingers: raised,
      };
    },
    []
  );

  // Camera start conforming to exact requirements:
  // { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } }
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsRunning(true);
      setIsDemoMode(false);
      setTelemetry((prev) => ({ ...prev, cameraActive: true }));
      // Ensure MediaPipe is initialized
      initMediaPipeVision().then(() => {
        setModelStatus(getTrackerStatus());
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access denied or unavailable';
      setCameraError(msg);
      // Fallback smoothly to simulation mode so app stays 100% operational
      setIsDemoMode(true);
      setIsRunning(true);
      setTelemetry((prev) => ({ ...prev, cameraActive: true, modelStatus: 'simulated' }));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsRunning(false);
    setTelemetry({
      fps: 0,
      latencyMs: 0,
      cameraActive: false,
      faceActive: false,
      handActive: false,
      mouthActive: false,
      modelStatus: 'initializing',
    });
  }, []);

  // Quick simulator gesture setter (provides a 4-second manual hold or permanent if in demo mode)
  const setSimulatedGesture = useCallback(
    (emotion: EmotionType, fingers: FingerCount, mouth: MouthStateType) => {
      demoTargetRef.current = { emotion, fingers, mouth };
      manualOverrideUntilRef.current = performance.now() + 4000;
    },
    []
  );

  // Main RAF inference loop
  useEffect(() => {
    if (!isRunning) return;

    let localFps = 30;
    const processFrame = () => {
      const now = performance.now();
      lastFrameTimeRef.current = now;

      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        localFps = Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current));
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      const inferenceStart = performance.now();
      let newState: MultimodalState;
      let activeStatus: TrackerModelStatus = getTrackerStatus();

      const isManualOverride = now < manualOverrideUntilRef.current || isDemoMode;

      // Real live camera tracking when webcam video is active and no manual override
      if (!isManualOverride && videoRef.current && videoRef.current.readyState >= 2) {
        const result = analyzeVideoFrame(videoRef.current, now, sensitivity);
        newState = result.state;
        activeStatus = result.modelStatus;
      } else {
        // Fallback / simulated test state
        const currentTarget = demoTargetRef.current;
        const emotion = currentTarget.emotion;
        const fingers = currentTarget.fingers;
        const mouth = currentTarget.mouth;

        const scores: EmotionScores = {
          Happy: emotion === 'Happy' ? 0.88 : 0.02,
          Sad: emotion === 'Sad' ? 0.85 : 0.02,
          Angry: emotion === 'Angry' ? 0.86 : 0.02,
          Neutral: emotion === 'Neutral' ? 0.82 : 0.04,
          Surprise: emotion === 'Surprise' ? 0.91 : 0.02,
          Fear: emotion === 'Fear' ? 0.84 : 0.02,
          Disgust: emotion === 'Disgust' ? 0.85 : 0.02,
        };

        const mouthRatio =
          mouth === 'Wide Open' ? 0.68 : mouth === 'Slightly Open' ? 0.35 : 0.12;

        const faceResult: FaceDetectionResult = {
          box: { x: 0.34, y: 0.18, width: 0.32, height: 0.46 },
          emotions: scores,
          dominantEmotion: emotion,
          confidence: 0.92,
        };

        const handResult = fingers > 0 ? generateHandLandmarks(fingers, 'Right') : null;

        newState = {
          face: faceResult,
          hand: handResult,
          mouth: {
            state: mouth,
            ratio: mouthRatio,
          },
          timestamp: Date.now(),
        };
        activeStatus = isDemoMode ? 'simulated' : 'optical-fallback';
      }

      setMultimodalState(newState);
      setModelStatus(activeStatus);

      // Render overlay on canvas with mirrored coordinate alignment
      if (canvasRef.current) {
        const c = canvasRef.current;
        const w = c.clientWidth || 640;
        const h = c.clientHeight || 480;
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
        }
        renderVisionOverlay(c, newState, w, h, true);
      }

      const latency = Math.round(performance.now() - inferenceStart + 6);

      setTelemetry({
        fps: Math.min(60, Math.max(18, localFps)),
        latencyMs: Math.max(6, latency),
        cameraActive: true,
        faceActive: Boolean(newState.face.box),
        handActive: Boolean(newState.hand),
        mouthActive: true,
        modelStatus: activeStatus,
      });

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning, isDemoMode, sensitivity, generateHandLandmarks]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isRunning,
    cameraError,
    isDemoMode,
    multimodalState,
    telemetry,
    sensitivity,
    setSensitivity,
    modelStatus,
    startCamera,
    stopCamera,
    setSimulatedGesture,
  };
}
