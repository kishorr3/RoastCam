import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMultimodalAI } from '../hooks/useMultimodalAI';
import { EmotionPanel } from './EmotionPanel';
import { HandPanel } from './HandPanel';
import { MouthPanel } from './MouthPanel';
import { RoastVerdict } from './RoastVerdict';
import { MissionCard } from './MissionCard';
import { TelemetryCard } from './TelemetryCard';
import { OctopusMascot } from './OctopusMascot';
import { SessionSummaryModal } from './SessionSummaryModal';
import { MISSIONS } from '../data/missions';
import { getRoastForState } from '../data/roasts';
import { speechService } from '../utils/speech';
import { sound } from '../utils/soundEffects';
import { EmotionType, FingerCount, MouthStateType, RoastRecord } from '../types';

interface LabPageProps {
  onBackToHome: () => void;
}

export const LabPage: React.FC<LabPageProps> = ({ onBackToHome }) => {
  const {
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
  } = useMultimodalAI();

  // Voice State
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(speechService.isMuted());

  // Roast state
  const [currentRoast, setCurrentRoast] = useState<RoastRecord | null>(null);

  // Missions & Progression State
  const [missionIndex, setMissionIndex] = useState<number>(0);
  const [scoreXP, setScoreXP] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(1);
  const [bestCombo, setBestCombo] = useState<number>(1);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [missionDwellProgress, setMissionDwellProgress] = useState<number>(0);
  const [isMissionJustCompleted, setIsMissionJustCompleted] = useState<boolean>(false);

  // Mascot reaction
  const [mascotSpeech, setMascotSpeech] = useState<string | null>(null);

  // Session report modal
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Active testing tab (for switching test gestures on simulated or live feeds)
  const [simEmotion, setSimEmotion] = useState<EmotionType>('Neutral');
  const [simFingers, setSimFingers] = useState<FingerCount>(0);
  const [simMouth, setSimMouth] = useState<MouthStateType>('Closed');

  // Auto-start camera when entering the Lab
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      speechService.cancel();
    };
  }, [startCamera, stopCamera]);

  // Handle Roast selection when state changes
  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      const outcome = getRoastForState(multimodalState);
      const newRecord: RoastRecord = {
        id: String(Date.now()),
        text: outcome.text,
        category: outcome.category,
        timestamp: Date.now(),
      };
      setCurrentRoast(newRecord);

      // Speak roast out loud using browser speech synthesis
      if (!isVoiceMuted) {
        speechService.speak(outcome.text);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    multimodalState.face.dominantEmotion,
    multimodalState.hand?.fingerCount,
    multimodalState.mouth.state,
    isRunning,
    isVoiceMuted,
  ]);

  // Mission Dwell & Evaluation Loop
  const currentMission = MISSIONS[missionIndex % MISSIONS.length];
  const dwellTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning || isMissionJustCompleted) return;

    const interval = setInterval(() => {
      const isMatching = currentMission.check(multimodalState);

      if (isMatching) {
        dwellTimerRef.current += 100;
        const progress = Math.min(1, dwellTimerRef.current / 1000); // 1.0s dwell
        setMissionDwellProgress(progress);

        if (progress >= 1) {
          // Mission Complete!
          sound.playMissionComplete();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#2BD7D0', '#FFF0A5', '#E6A4C8', '#9A8CE6'],
          });

          const newCombo = comboCount + 1;
          setComboCount(newCombo);
          if (newCombo > bestCombo) setBestCombo(newCombo);

          setScoreXP((prev) => prev + currentMission.xp * comboCount);
          setCompletedCount((prev) => prev + 1);
          setIsMissionJustCompleted(true);
          setMascotSpeech('Mission Cleared!');

          setTimeout(() => {
            setIsMissionJustCompleted(false);
            setMissionDwellProgress(0);
            dwellTimerRef.current = 0;
            setMissionIndex((prev) => (prev + 1) % MISSIONS.length);
          }, 1400);
        }
      } else {
        dwellTimerRef.current = Math.max(0, dwellTimerRef.current - 150);
        setMissionDwellProgress(dwellTimerRef.current / 1000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, currentMission, multimodalState, comboCount, bestCombo, isMissionJustCompleted]);

  // Helper to force speak current roast
  const handleSpeakCurrent = () => {
    if (currentRoast) {
      speechService.speak(currentRoast.text, true);
    }
  };

  // Toggle voice mute
  const handleToggleVoice = () => {
    const nextMuted = speechService.toggleMuted();
    setIsVoiceMuted(nextMuted);
  };

  // Force re-roast
  const handleRefreshRoast = () => {
    sound.playSnap();
    const outcome = getRoastForState(multimodalState);
    const newRecord: RoastRecord = {
      id: String(Date.now()),
      text: outcome.text,
      category: outcome.category,
      timestamp: Date.now(),
    };
    setCurrentRoast(newRecord);
    if (!isVoiceMuted) {
      speechService.speak(outcome.text, true);
    }
  };

  // Skip Mission
  const handleSkipMission = () => {
    sound.playChirp();
    setComboCount(1);
    setMissionDwellProgress(0);
    dwellTimerRef.current = 0;
    setMissionIndex((prev) => (prev + 1) % MISSIONS.length);
  };

  // Update simulator values
  const applySimulation = (
    emo: EmotionType = simEmotion,
    fingers: FingerCount = simFingers,
    mouth: MouthStateType = simMouth
  ) => {
    setSimEmotion(emo);
    setSimFingers(fingers);
    setSimMouth(mouth);
    setSimulatedGesture(emo, fingers, mouth);
  };

  return (
    <div id="lab-page-root" className="min-h-screen bg-[#242424] text-[#171717] px-3 sm:px-6 py-6 font-sans-body">
      {/* Outer Lab Container */}
      <div className="max-w-7xl mx-auto bg-[#F3C8DE] rounded-3xl sm:rounded-[36px] border-dark-solid shadow-retro-lg p-4 sm:p-6 lg:p-8 relative">
        
        {/* Subtle Paper Background Texture */}
        <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none"></div>

        {/* Top Control Bar */}
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#171717] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              id="back-to-landing-btn"
              onClick={() => {
                stopCamera();
                onBackToHome();
              }}
              className="px-3.5 py-1.5 rounded-xl border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#FBF4E6] text-xs font-bold text-[#171717] shadow-retro-sm flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Landing</span>
            </button>

            <div className="hidden sm:block">
              <h2 className="font-display font-black text-xl text-[#171717] uppercase tracking-tight">
                Useless AI Lab
              </h2>
              <p className="text-[10px] font-pixel text-[#555555]">
                Face + Hand + Mouth Multimodal Inference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Camera Toggle */}
            <button
              id="camera-power-btn"
              onClick={() => {
                if (isRunning) stopCamera();
                else startCamera();
              }}
              className={`px-3 py-1.5 rounded-xl border-2 border-[#171717] text-xs font-bold flex items-center gap-1.5 shadow-retro-sm transition-all ${
                isRunning ? 'bg-[#2BD7D0] text-[#171717]' : 'bg-[#EADDC9] text-[#777777]'
              }`}
            >
              {isRunning ? <Camera size={14} /> : <CameraOff size={14} />}
              <span>{isRunning ? 'Camera Online' : 'Camera Stopped'}</span>
            </button>

            {/* Voice Mute Toggle */}
            <button
              id="voice-toggle-top-btn"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border-2 border-[#171717] shadow-retro-sm transition-all ${
                isVoiceMuted ? 'bg-[#EADDC9] text-[#777777]' : 'bg-[#FFF0A5] text-[#171717]'
              }`}
              title={isVoiceMuted ? 'Unmute Speech' : 'Mute Speech'}
            >
              {isVoiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Finish & View Report CTA */}
            <button
              id="finish-session-btn"
              onClick={() => setShowSummaryModal(true)}
              className="px-4 py-1.5 rounded-xl border-2 border-[#171717] bg-[#9A8CE6] hover:bg-[#8675d8] text-[#FFFFFF] font-display font-bold text-xs shadow-retro-sm flex items-center gap-1.5 transition-all"
            >
              <CheckCircle size={14} />
              <span>Session Report</span>
            </button>
          </div>
        </header>

        {/* Main 2-Column Grid Layout (PDF Page 9) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT / CENTER COLUMN (7 Cols): Camera Viewport, Overlays & Mascot */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Main Camera Viewport Module */}
            <div
              id="camera-viewport-module"
              className="relative w-full aspect-4/3 sm:aspect-16/10 bg-[#171717] rounded-3xl border-dark-solid shadow-retro overflow-hidden flex items-center justify-center"
            >
              {/* Actual Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 w-full h-full object-cover mirror-video pointer-events-none"
              />

              {/* Overlay Canvas (Coordinates mapped to mirrored camera feed with forward-facing text) */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              />

              {/* Camera Offline or Demo Mode Banner */}
              {(!isRunning || isDemoMode) && (
                <div className="absolute inset-0 bg-[#171717]/85 flex flex-col items-center justify-center p-6 text-center z-20 text-[#FFFFFF]">
                  <div className="w-12 h-12 rounded-full bg-[#E6A4C8] text-[#171717] flex items-center justify-center mb-3 font-pixel text-xl">
                    AI
                  </div>
                  <h3 className="font-display font-black text-xl text-[#2BD7D0] uppercase">
                    {isDemoMode ? 'Vision Simulator Active' : 'Camera Offline'}
                  </h3>
                  <p className="text-xs text-[#EADDC9] max-w-sm mt-1 mb-4">
                    {cameraError
                      ? `Camera note: ${cameraError}. Interactive simulator enabled.`
                      : 'Webcam ready for multimodal tracking and comedy.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[#2BD7D0] text-[#171717] font-bold text-xs border-2 border-[#FFFFFF] shadow-sm flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Play size={14} />
                    <span>Connect Webcam</span>
                  </button>
                </div>
              )}

              {/* TOP OVERLAY HUD: Live Badge, Tracking Engine, Sensitivity & Mascot */}
              <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
                  <span className="flex items-center gap-1.5 bg-[#171717] text-[#2BD7D0] font-pixel text-[10px] px-2.5 py-1 rounded-full border border-[#2BD7D0]">
                    <span className="w-2 h-2 rounded-full bg-[#2BD7D0] animate-ping"></span>
                    LIVE
                  </span>
                  <span className="bg-[#171717]/90 text-[#FFF0A5] font-mono text-[10px] px-2.5 py-1 rounded-md border border-[#171717]">
                    {modelStatus === 'mediapipe'
                      ? '✨ 478-PT FACEMESH'
                      : modelStatus === 'optical-fallback'
                      ? '⚡ OPTICAL CV'
                      : '⌛ INITIALIZING AI...'}
                  </span>

                  {/* Sensitivity Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-[#171717]/90 px-2 py-0.5 rounded-lg border border-[#2BD7D0]/30">
                    <span className="text-[#EADDC9] font-mono text-[9px] uppercase mr-0.5">
                      Sens:
                    </span>
                    {(['normal', 'high', 'ultra'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSensitivity(lvl)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                          sensitivity === lvl
                            ? 'bg-[#2BD7D0] text-[#171717]'
                            : 'text-[#EADDC9]/70 hover:text-[#FFFFFF]'
                        }`}
                        title={`Set expression tracking sensitivity to ${lvl}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pixel-Art Octopus crawling on camera border */}
                <div className="pointer-events-auto -mt-2 -mr-1">
                  <OctopusMascot
                    reaction={isMissionJustCompleted ? 'celebrating' : 'idle'}
                    customSpeech={mascotSpeech}
                  />
                </div>
              </div>

              {/* BOTTOM OVERLAY HUD: Summary Strip */}
              <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
                <div className="bg-[#171717]/90 text-[#FFFFFF] backdrop-blur-xs rounded-xl border-2 border-[#2BD7D0] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shadow-retro-sm">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-[#2BD7D0] font-pixel">STATE:</span>
                    <span>
                      Fingers: {multimodalState.hand ? multimodalState.hand.fingerCount : 0} | Mood:{' '}
                      {multimodalState.face.dominantEmotion} | Mouth: {multimodalState.mouth.state}
                    </span>
                  </div>

                  <span className="text-[10px] font-pixel bg-[#2BD7D0] text-[#171717] px-2 py-0.5 rounded font-bold">
                    FUSED 100%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Test / Gesture Sandbox Controls (PDF Page 2 & 11) */}
            <div
              id="gesture-sandbox-controls"
              className="bg-[#FBF4E6] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#9A8CE6]" />
                  <span className="font-display font-bold text-xs uppercase tracking-wide text-[#171717]">
                    Quick Gesture Injector (Simulator & Mission Shortcuts)
                  </span>
                </div>
                <span className="text-[10px] text-[#666666]">Click to test roasts & missions</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                <button
                  onClick={() => applySimulation('Happy', 4, 'Slightly Open')}
                  className="p-2 rounded-xl border-2 border-[#171717] bg-[#FFF0A5] hover:bg-[#FFE875] text-left shadow-retro-sm transition-all"
                >
                  <span className="block text-[10px] text-[#777777]">COMBINED</span>
                  <span>😄 Smile + 4 Fingers</span>
                </button>

                <button
                  onClick={() => applySimulation('Surprise', 2, 'Wide Open')}
                  className="p-2 rounded-xl border-2 border-[#171717] bg-[#D8D0FF] hover:bg-[#c3b6fd] text-left shadow-retro-sm transition-all"
                >
                  <span className="block text-[10px] text-[#777777]">MISSION 5</span>
                  <span>😲 Shock + Peace</span>
                </button>

                <button
                  onClick={() => applySimulation('Happy', 5, 'Wide Open')}
                  className="p-2 rounded-xl border-2 border-[#171717] bg-[#2BD7D0] hover:bg-[#22bfb8] text-left shadow-retro-sm transition-all"
                >
                  <span className="block text-[10px] text-[#777777]">PRIORITY ROAST</span>
                  <span>✋ 5 Fingers + Mouth</span>
                </button>

                <button
                  onClick={() => applySimulation('Neutral', 0, 'Closed')}
                  className="p-2 rounded-xl border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#F3C8DE] text-left shadow-retro-sm transition-all"
                >
                  <span className="block text-[10px] text-[#777777]">RESET</span>
                  <span>😐 Neutral Stare</span>
                </button>
              </div>
            </div>

            {/* Live Roast Verdict Component */}
            <RoastVerdict
              currentRoast={currentRoast}
              isVoiceMuted={isVoiceMuted}
              onToggleVoice={handleToggleVoice}
              onRefreshRoast={handleRefreshRoast}
              onSpeakCurrent={handleSpeakCurrent}
            />
          </div>

          {/* RIGHT COLUMN (5 Cols): Modality Cards, Missions, Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mission Card */}
            <MissionCard
              currentMission={currentMission}
              dwellProgress={missionDwellProgress}
              isCompleted={isMissionJustCompleted}
              scoreXP={scoreXP}
              comboCount={comboCount}
              completedCount={completedCount}
              totalMissions={MISSIONS.length}
              onSkipMission={handleSkipMission}
            />

            {/* Emotion Analysis Card */}
            <EmotionPanel
              emotions={multimodalState.face.emotions}
              dominantEmotion={multimodalState.face.dominantEmotion}
              confidence={multimodalState.face.confidence}
            />

            {/* Hand Tracking Card */}
            <HandPanel hand={multimodalState.hand} />

            {/* Mouth Aperture Card */}
            <MouthPanel mouth={multimodalState.mouth} />

            {/* Telemetry Card */}
            <TelemetryCard telemetry={telemetry} />
          </div>
        </div>
      </div>

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={showSummaryModal}
        scoreXP={scoreXP}
        completedMissions={completedCount}
        totalMissions={MISSIONS.length}
        bestCombo={bestCombo}
        dominantEmotion={multimodalState.face.dominantEmotion}
        onRestart={() => {
          setShowSummaryModal(false);
          setScoreXP(0);
          setComboCount(1);
          setCompletedCount(0);
          setMissionIndex(0);
        }}
        onExitHome={() => {
          setShowSummaryModal(false);
          stopCamera();
          onBackToHome();
        }}
      />
    </div>
  );
};
