import React from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { RoastRecord } from '../types';

interface RoastVerdictProps {
  currentRoast: RoastRecord | null;
  isVoiceMuted: boolean;
  onToggleVoice: () => void;
  onRefreshRoast: () => void;
  onSpeakCurrent: () => void;
}

export const RoastVerdict: React.FC<RoastVerdictProps> = ({
  currentRoast,
  isVoiceMuted,
  onToggleVoice,
  onRefreshRoast,
  onSpeakCurrent,
}) => {
  return (
    <div
      id="roast-verdict-card"
      className="bg-[#FBF4E6] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3 relative"
    >
      {/* Header with category and voice toggle */}
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FFF0A5] border border-[#171717] text-xs">
            🔥
          </span>
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            Live AI Roast Verdict
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {currentRoast && (
            <span className="text-[10px] font-pixel bg-[#D8D0FF] text-[#171717] px-2 py-0.5 rounded border border-[#171717] uppercase">
              {currentRoast.category}
            </span>
          )}

          {/* Voice Mute/Unmute Toggle */}
          <button
            id="voice-mute-toggle-btn"
            onClick={onToggleVoice}
            className={`p-1.5 rounded-lg border-2 border-[#171717] transition-all ${
              isVoiceMuted
                ? 'bg-[#EADDC9] text-[#777777] hover:bg-[#E0D0B8]'
                : 'bg-[#2BD7D0] text-[#171717] shadow-retro-sm hover:scale-105'
            }`}
            title={isVoiceMuted ? 'Unmute Text-to-Speech' : 'Mute Text-to-Speech'}
          >
            {isVoiceMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Comic Speech Bubble */}
      <div
        id="roast-speech-bubble"
        className="bg-[#FFFFFF] rounded-xl border-2 border-[#171717] p-4 shadow-retro-sm relative my-1"
      >
        <p className="text-base sm:text-lg font-bold text-[#171717] leading-snug font-sans-body">
          {currentRoast ? `“${currentRoast.text}”` : '“Observing human specimen... preparing diagnosis.”'}
        </p>

        {/* Small bubble tail */}
        <div className="absolute -bottom-2 left-8 w-3.5 h-3.5 bg-[#FFFFFF] border-r-2 border-b-2 border-[#171717] rotate-45"></div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#666666] font-medium flex items-center gap-1">
          <Sparkles size={12} className="text-[#9A8CE6]" />
          <span>Local browser inference</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            id="speak-again-btn"
            onClick={onSpeakCurrent}
            disabled={isVoiceMuted}
            className={`text-xs font-bold px-2.5 py-1 rounded-lg border-2 border-[#171717] transition-all flex items-center gap-1 ${
              isVoiceMuted
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                : 'bg-[#FFF0A5] text-[#171717] hover:bg-[#FFE875] shadow-retro-sm'
            }`}
            title="Read roast aloud"
          >
            <Volume2 size={13} />
            <span>Speak</span>
          </button>

          <button
            id="re-roast-btn"
            onClick={onRefreshRoast}
            className="text-xs font-bold px-2.5 py-1 rounded-lg border-2 border-[#171717] bg-[#D8D0FF] text-[#171717] hover:bg-[#C2B5FF] shadow-retro-sm flex items-center gap-1"
            title="Force refresh roast"
          >
            <RefreshCw size={13} />
            <span>Re-Roast</span>
          </button>
        </div>
      </div>
    </div>
  );
};
