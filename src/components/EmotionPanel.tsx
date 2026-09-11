import React from 'react';
import { EmotionScores, EmotionType } from '../types';

interface EmotionPanelProps {
  emotions: EmotionScores;
  dominantEmotion: EmotionType;
  confidence: number;
}

const EMOTION_EMOJIS: Record<EmotionType, string> = {
  Happy: '😄',
  Sad: '😢',
  Angry: '😡',
  Neutral: '😐',
  Surprise: '😲',
  Fear: '😨',
  Disgust: '🤢',
};

export const EmotionPanel: React.FC<EmotionPanelProps> = ({
  emotions,
  dominantEmotion,
  confidence,
}) => {
  const emotionKeys: EmotionType[] = [
    'Happy',
    'Sad',
    'Angry',
    'Neutral',
    'Surprise',
    'Fear',
    'Disgust',
  ];

  return (
    <div
      id="emotion-analysis-card"
      className="bg-[#FBF4E6] rounded-2xl border-2 border-[#171717] shadow-retro p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2BD7D0] border border-[#171717] animate-pulse"></span>
          <h3 className="font-display font-bold text-sm tracking-wide text-[#171717] uppercase">
            01 / Emotion Matrix
          </h3>
        </div>
        <span className="text-[11px] font-pixel bg-[#FFF0A5] px-2 py-0.5 rounded border border-[#171717]">
          WIN: {dominantEmotion.toUpperCase()} ({Math.round(confidence * 100)}%)
        </span>
      </div>

      {/* 7-class dynamic progress bars */}
      <div className="space-y-2">
        {emotionKeys.map((emo) => {
          const val = emotions[emo] || 0;
          const isWinner = emo === dominantEmotion;
          const pct = Math.round(val * 100);

          return (
            <div key={emo} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#171717]">
                  <span>{EMOTION_EMOJIS[emo]}</span>
                  <span>{emo}</span>
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    isWinner ? 'text-[#171717] font-bold' : 'text-[#666666]'
                  }`}
                >
                  {pct}%
                </span>
              </div>
              {/* Progress track */}
              <div className="w-full h-3 bg-[#EADDC9] rounded-full border border-[#171717] overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 border-r border-[#171717] ${
                    isWinner
                      ? 'bg-[#2BD7D0] shadow-sm'
                      : 'bg-[#E6A4C8]'
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
