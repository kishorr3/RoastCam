import React from 'react';
import { HandLandmarks } from '../types';

interface HandPanelProps {
  hand: HandLandmarks | null;
}

export const HandPanel: React.FC<HandPanelProps> = ({ hand }) => {
  const fingerCount = hand ? hand.fingerCount : 0;
  const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
  const raisedFingers = hand ? hand.raisedFingers : [false, false, false, false, false];

  return (
    <div
      id="hand-tracking-card"
      className="bg-[#F3C8DE] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E6A4C8] border border-[#171717]"></span>
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            02 / Hand Telemetry
          </h3>
        </div>
        <span className="text-[11px] font-pixel bg-[#D8D0FF] px-2 py-0.5 rounded border border-[#171717]">
          21 LANDMARKS
        </span>
      </div>

      {/* Main Count Highlight */}
      <div className="bg-[#FFFFFF] rounded-xl border-2 border-[#171717] p-3 flex items-center justify-between shadow-retro-sm">
        <div>
          <p className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">
            Fingers Raised
          </p>
          <div className="text-3xl font-display font-extrabold text-[#171717]">
            {fingerCount} <span className="text-sm font-normal text-[#888888]">/ 5</span>
          </div>
        </div>
        <div className="text-3xl">
          {fingerCount === 0 && '✊'}
          {fingerCount === 1 && '☝️'}
          {fingerCount === 2 && '✌️'}
          {fingerCount === 3 && '🤟'}
          {fingerCount === 4 && '🖖'}
          {fingerCount === 5 && '🖐️'}
        </div>
      </div>

      {/* Individual Finger Indicators */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {fingerNames.map((name, i) => {
          const isUp = raisedFingers[i];
          return (
            <div
              key={name}
              className={`flex flex-col items-center py-1.5 px-1 rounded-lg border-2 border-[#171717] text-[10px] font-bold transition-all ${
                isUp
                  ? 'bg-[#2BD7D0] text-[#171717] shadow-retro-sm -translate-y-0.5'
                  : 'bg-[#FBF4E6] text-[#777777]'
              }`}
            >
              <span>{isUp ? 'UP' : 'DOWN'}</span>
              <span className="truncate max-w-full text-[9px] mt-0.5">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
