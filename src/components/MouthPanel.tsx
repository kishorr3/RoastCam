import React from 'react';
import { MouthDetectionResult } from '../types';

interface MouthPanelProps {
  mouth: MouthDetectionResult;
}

export const MouthPanel: React.FC<MouthPanelProps> = ({ mouth }) => {
  const getBadgeColor = () => {
    switch (mouth.state) {
      case 'Closed':
        return 'bg-[#FFF0A5] text-[#171717]';
      case 'Slightly Open':
        return 'bg-[#E6A4C8] text-[#171717]';
      case 'Wide Open':
        return 'bg-[#2BD7D0] text-[#171717]';
    }
  };

  return (
    <div
      id="mouth-status-card"
      className="bg-[#D8D0FF] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9A8CE6] border border-[#171717]"></span>
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            03 / Mouth Aperture
          </h3>
        </div>
        <span className="text-[11px] font-pixel bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#171717]">
          RATIO: {(mouth.ratio * 100).toFixed(0)}%
        </span>
      </div>

      {/* Main State Card */}
      <div className="bg-[#FFFFFF] rounded-xl border-2 border-[#171717] p-3 flex items-center justify-between shadow-retro-sm">
        <div>
          <p className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
            Current Aperture
          </p>
          <div className="text-xl font-display font-black text-[#171717]">
            {mouth.state.toUpperCase()}
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border-2 border-[#171717] ${getBadgeColor()}`}>
          {mouth.state === 'Closed' ? '🤐 SEALED' : mouth.state === 'Slightly Open' ? '😮 LEAKING' : '📢 WIDE OPEN'}
        </span>
      </div>

      {/* Aperture Meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-semibold text-[#171717]">
          <span>Closed (0%)</span>
          <span>Slightly (35%)</span>
          <span>Wide (70%+)</span>
        </div>
        <div className="w-full h-3 bg-[#FFFFFF] rounded-full border-2 border-[#171717] overflow-hidden p-0.5">
          <div
            className="h-full bg-[#9A8CE6] rounded-full border-r border-[#171717] transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(5, mouth.ratio * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
