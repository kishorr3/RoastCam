import React, { useEffect, useState } from 'react';

interface OctopusMascotProps {
  className?: string;
  reaction?: 'idle' | 'roasting' | 'celebrating' | 'surprised';
  customSpeech?: string | null;
}

export const OctopusMascot: React.FC<OctopusMascotProps> = ({
  className = '',
  reaction = 'idle',
  customSpeech,
}) => {
  const [speech, setSpeech] = useState<string | null>(customSpeech || null);
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    if (customSpeech) {
      setSpeech(customSpeech);
      setIsWiggling(true);
      const timer = setTimeout(() => {
        setIsWiggling(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [customSpeech]);

  return (
    <div
      id="octopus-mascot-container"
      className={`relative inline-flex flex-col items-center select-none pointer-events-auto transition-transform ${className}`}
    >
      {/* Speech Bubble */}
      {speech && (
        <div
          id="octopus-speech-bubble"
          className="absolute -top-12 z-20 bg-[#FBF4E6] text-[#171717] text-xs font-semibold px-2.5 py-1 rounded-xl border-2 border-[#171717] shadow-retro-sm whitespace-nowrap animate-bounce"
        >
          {speech}
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#FBF4E6] border-r-2 border-b-2 border-[#171717] rotate-45"></div>
        </div>
      )}

      {/* Pixel Art Octopus SVG matching octo.png */}
      <div
        className={`w-16 h-16 transition-transform duration-300 ${
          isWiggling || reaction === 'celebrating'
            ? 'scale-110 -rotate-3 animate-pulse'
            : 'hover:scale-105'
        }`}
        onClick={() => {
          setIsWiggling(true);
          const quotes = [
            'Bloop!',
            'I see that face.',
            'Zero usefulness confirmed.',
            '100% Client-side!',
            'Nice hands, bro.',
          ];
          setSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
          setTimeout(() => setIsWiggling(false), 2000);
        }}
        title="RoastCam Mascot - Click for bloop!"
      >
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full pixelated drop-shadow-md cursor-pointer"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Body Outline */}
          <rect x="11" y="5" width="10" height="2" fill="#3D1D28" />
          <rect x="9" y="7" width="14" height="2" fill="#3D1D28" />
          <rect x="8" y="9" width="16" height="6" fill="#3D1D28" />

          {/* Octopus Head Soft Coral/Pink Fill */}
          <rect x="11" y="7" width="10" height="2" fill="#F492A7" />
          <rect x="10" y="9" width="12" height="7" fill="#F492A7" />
          {/* Highlights & Texture */}
          <rect x="12" y="7" width="4" height="1" fill="#FFB6C6" />
          <rect x="10" y="9" width="3" height="3" fill="#FFB6C6" />
          <rect x="19" y="11" width="3" height="3" fill="#DF6582" />

          {/* Characteristic Rectangular Eyes from octo.png */}
          {/* Left Eye */}
          <rect x="11" y="11" width="3" height="5" fill="#3D1D28" />
          <rect x="11" y="12" width="2" height="3" fill="#2BD7D0" />
          <rect x="11" y="12" width="2" height="1" fill="#FFFFFF" />

          {/* Right Eye */}
          <rect x="18" y="11" width="3" height="5" fill="#3D1D28" />
          <rect x="19" y="12" width="2" height="3" fill="#2BD7D0" />
          <rect x="19" y="12" width="2" height="1" fill="#FFFFFF" />

          {/* Tentacles Outline & Fill */}
          {/* Far Left Tentacle */}
          <rect x="4" y="15" width="4" height="3" fill="#3D1D28" />
          <rect x="3" y="16" width="4" height="4" fill="#F492A7" />
          <rect x="5" y="18" width="4" height="3" fill="#DF6582" />

          {/* Mid Left Tentacle */}
          <rect x="6" y="17" width="4" height="5" fill="#3D1D28" />
          <rect x="7" y="16" width="4" height="5" fill="#F492A7" />
          <rect x="8" y="19" width="4" height="4" fill="#DF6582" />

          {/* Front Center Left Tentacle */}
          <rect x="10" y="17" width="4" height="8" fill="#3D1D28" />
          <rect x="11" y="17" width="3" height="7" fill="#F492A7" />
          <rect x="11" y="22" width="3" height="2" fill="#DF6582" />

          {/* Front Center Right Tentacle */}
          <rect x="17" y="17" width="4" height="8" fill="#3D1D28" />
          <rect x="17" y="17" width="3" height="7" fill="#F492A7" />
          <rect x="17" y="22" width="3" height="2" fill="#DF6582" />

          {/* Mid Right Tentacle */}
          <rect x="21" y="17" width="4" height="5" fill="#3D1D28" />
          <rect x="20" y="16" width="4" height="5" fill="#F492A7" />
          <rect x="19" y="19" width="4" height="4" fill="#DF6582" />

          {/* Far Right Tentacle */}
          <rect x="24" y="15" width="4" height="3" fill="#3D1D28" />
          <rect x="25" y="16" width="4" height="4" fill="#F492A7" />
          <rect x="23" y="18" width="4" height="3" fill="#DF6582" />

          {/* Cute Blushing Cheeks */}
          <rect x="9" y="14" width="2" height="1" fill="#E84D74" />
          <rect x="21" y="14" width="2" height="1" fill="#E84D74" />
        </svg>
      </div>
    </div>
  );
};
