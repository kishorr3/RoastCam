export type EmotionType =
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Neutral'
  | 'Surprise'
  | 'Fear'
  | 'Disgust';

export type MouthStateType = 'Closed' | 'Slightly Open' | 'Wide Open';

export type FingerCount = 0 | 1 | 2 | 3 | 4 | 5;

export type EmotionScores = Record<EmotionType, number>;

export interface Point2D {
  x: number; // Normalized 0..1
  y: number; // Normalized 0..1
}

export interface HandLandmarks {
  points: Point2D[]; // 21 points
  fingerCount: FingerCount;
  handedness: 'Left' | 'Right';
  raisedFingers: boolean[]; // 5 booleans [thumb, index, middle, ring, pinky]
}

export interface FaceDetectionResult {
  box: { x: number; y: number; width: number; height: number } | null;
  emotions: EmotionScores;
  dominantEmotion: EmotionType;
  confidence: number;
}

export interface MouthDetectionResult {
  state: MouthStateType;
  ratio: number; // 0..1 (vertical distance / horizontal lip width)
}

export interface MultimodalState {
  face: FaceDetectionResult;
  hand: HandLandmarks | null;
  mouth: MouthDetectionResult;
  timestamp: number;
}

export interface TelemetryData {
  fps: number;
  latencyMs: number;
  cameraActive: boolean;
  faceActive: boolean;
  handActive: boolean;
  mouthActive: boolean;
  modelStatus?: 'initializing' | 'mediapipe' | 'optical-fallback' | 'simulated';
}

export interface Mission {
  id: string;
  title: string;
  instruction: string;
  badge: string;
  xp: number;
  check: (state: MultimodalState) => boolean;
}

export interface RoastRecord {
  id: string;
  text: string;
  category: 'emotion' | 'finger' | 'mouth' | 'combined';
  timestamp: number;
}
