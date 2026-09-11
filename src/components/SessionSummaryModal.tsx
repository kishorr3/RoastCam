import React from 'react';
import { Award, Zap, Smile, Hand, ArrowLeft, RotateCcw } from 'lucide-react';
import { EmotionType } from '../types';

interface SessionSummaryModalProps {
  isOpen: boolean;
  scoreXP: number;
  completedMissions: number;
  totalMissions: number;
  bestCombo: number;
  dominantEmotion: EmotionType;
  onRestart: () => void;
  onExitHome: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  scoreXP,
  completedMissions,
  totalMissions,
  bestCombo,
  dominantEmotion,
  onRestart,
  onExitHome,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="session-summary-modal-overlay"
      className="fixed inset-0 z-50 bg-[#171717]/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="session-summary-card"
        className="bg-[#FBF4E6] max-w-md w-full rounded-3xl border-dark-solid shadow-retro-lg p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="font-pixel text-[11px] bg-[#FFF0A5] px-3 py-1 rounded-full border border-[#171717] inline-block mb-1">
            SESSION COMPLETE
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-[#171717]">
            ROASTCAM REPORT
          </h2>
          <p className="text-xs text-[#666666] font-medium">
            Your comprehensive, totally unnecessary multimodal assessment
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FFFFFF] p-3 rounded-2xl border-2 border-[#171717] shadow-retro-sm flex flex-col items-center text-center">
            <Award className="text-[#9A8CE6] mb-1" size={20} />
            <span className="text-[10px] uppercase font-bold text-[#777777]">Total Score</span>
            <span className="text-xl font-display font-black text-[#171717]">{scoreXP} XP</span>
          </div>

          <div className="bg-[#FFFFFF] p-3 rounded-2xl border-2 border-[#171717] shadow-retro-sm flex flex-col items-center text-center">
            <Zap className="text-[#2BD7D0] mb-1" size={20} />
            <span className="text-[10px] uppercase font-bold text-[#777777]">Best Combo</span>
            <span className="text-xl font-display font-black text-[#171717]">{bestCombo}x</span>
          </div>

          <div className="bg-[#FFFFFF] p-3 rounded-2xl border-2 border-[#171717] shadow-retro-sm flex flex-col items-center text-center">
            <Smile className="text-[#E6A4C8] mb-1" size={20} />
            <span className="text-[10px] uppercase font-bold text-[#777777]">Dominant Mood</span>
            <span className="text-base font-display font-extrabold text-[#171717]">{dominantEmotion}</span>
          </div>

          <div className="bg-[#FFFFFF] p-3 rounded-2xl border-2 border-[#171717] shadow-retro-sm flex flex-col items-center text-center">
            <Hand className="text-[#FFF0A5] mb-1" size={20} />
            <span className="text-[10px] uppercase font-bold text-[#777777]">Missions</span>
            <span className="text-base font-display font-extrabold text-[#171717]">
              {completedMissions} / {totalMissions}
            </span>
          </div>
        </div>

        {/* Final Product Statement Box from PDF Page 12 */}
        <div className="bg-[#E6A4C8] p-4 rounded-2xl border-2 border-[#171717] shadow-retro-sm space-y-2">
          <div className="font-pixel text-[11px] text-[#171717] text-center font-bold tracking-wide">
            OFFICIAL EVALUATION
          </div>
          <div className="bg-[#FFFFFF] p-3 rounded-xl border-2 border-[#171717] text-center space-y-1">
            <p className="text-xs font-bold text-[#171717] leading-relaxed">
              USEFULNESS: 0% | TECHNICAL VALUE: 100% | NECESSITY: QUESTIONABLE
            </p>
            <p className="text-[11px] text-[#666666]">
              All inference ran strictly client-side. Zero video leaves your device.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            id="exit-to-home-btn"
            onClick={onExitHome}
            className="flex-1 py-2.5 px-3 rounded-xl border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#F3C8DE] text-[#171717] font-bold text-xs shadow-retro-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Return Home</span>
          </button>

          <button
            id="restart-session-btn"
            onClick={onRestart}
            className="flex-1 py-2.5 px-3 rounded-xl border-2 border-[#171717] bg-[#2BD7D0] hover:bg-[#20c2bc] text-[#171717] font-bold text-xs shadow-retro-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw size={14} />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
