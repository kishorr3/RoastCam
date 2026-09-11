import React from 'react';
import { Award, Zap, CheckCircle2 } from 'lucide-react';
import { Mission } from '../types';

interface MissionCardProps {
  currentMission: Mission;
  dwellProgress: number; // 0 to 1
  isCompleted: boolean;
  scoreXP: number;
  comboCount: number;
  completedCount: number;
  totalMissions: number;
  onSkipMission: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  currentMission,
  dwellProgress,
  isCompleted,
  scoreXP,
  comboCount,
  completedCount,
  totalMissions,
  onSkipMission,
}) => {
  return (
    <div
      id="mission-system-card"
      className="bg-[#FFF0A5] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Top Header: Score & Combo */}
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-[#171717]" />
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            HCI Missions ({completedCount}/{totalMissions})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {comboCount > 1 && (
            <span className="text-[10px] font-pixel bg-[#E6A4C8] text-[#171717] px-2 py-0.5 rounded border border-[#171717] flex items-center gap-1 animate-bounce">
              <Zap size={10} /> {comboCount}x COMBO
            </span>
          )}
          <span className="text-xs font-pixel bg-[#FFFFFF] text-[#171717] px-2.5 py-0.5 rounded-full border border-[#171717] font-bold">
            {scoreXP} XP
          </span>
        </div>
      </div>

      {/* Active Mission Banner */}
      <div className="bg-[#FFFFFF] rounded-xl border-2 border-[#171717] p-3 shadow-retro-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#666666] tracking-wider uppercase block">
              {currentMission.title}
            </span>
            <p className="text-sm font-bold text-[#171717] mt-0.5 font-sans-body">
              {currentMission.instruction}
            </p>
          </div>
          <span className="text-2xl flex-shrink-0">{currentMission.badge}</span>
        </div>

        {/* Dwell Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-[#555555]">
              {isCompleted
                ? 'COMPLETED!'
                : dwellProgress > 0
                ? 'HOLD POSE...'
                : 'AWAITING MATCH'}
            </span>
            <span className="text-[#171717]">+{currentMission.xp} XP</span>
          </div>

          <div className="w-full h-3 bg-[#FBF4E6] rounded-full border-2 border-[#171717] overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isCompleted
                  ? 'bg-[#2BD7D0]'
                  : dwellProgress > 0
                  ? 'bg-[#9A8CE6]'
                  : 'bg-transparent'
              }`}
              style={{ width: `${Math.min(100, Math.max(isCompleted ? 100 : 0, dwellProgress * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        <span className="text-[11px] text-[#666666] font-medium flex items-center gap-1">
          <CheckCircle2 size={12} className="text-green-600" />
          <span>Hold condition for 1s</span>
        </span>

        <button
          id="skip-mission-btn"
          onClick={onSkipMission}
          className="text-[11px] font-bold text-[#171717] hover:underline px-2 py-0.5"
        >
          Skip Mission →
        </button>
      </div>
    </div>
  );
};
