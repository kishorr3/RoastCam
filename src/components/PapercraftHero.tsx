import React from 'react';

interface PapercraftHeroProps {
  scrollProgress: number; // 0 (touching high-five) to 1 (fully separated to edges)
  onHighFiveTap?: () => void;
}

export const PapercraftHero: React.FC<PapercraftHeroProps> = ({
  scrollProgress,
  onHighFiveTap,
}) => {
  // Interpolate horizontal offset: 0px at start, up to 180px apart
  const separationX = Math.min(1, Math.max(0, scrollProgress)) * 160;
  const isHighFiveTouching = scrollProgress < 0.08;

  return (
    <div
      id="papercraft-hero-stage"
      className="relative w-full max-w-4xl mx-auto h-[480px] sm:h-[560px] flex items-center justify-center overflow-hidden select-none"
    >
      {/* SVG Definitions for Paper Layer Filters */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Outer thick sticker paper backing drop shadow */}
          <filter id="paper-sticker-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="6" stdDeviation="6" floodColor="#171717" floodOpacity="0.22" />
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#171717" floodOpacity="0.12" />
          </filter>

          {/* Interior subtle paper cut layer depth */}
          <filter id="paper-layer-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2.5" stdDeviation="2" floodColor="#171717" floodOpacity="0.15" />
          </filter>

          {/* Micro paper fold shadow */}
          <filter id="paper-micro-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0.5" dy="1.5" stdDeviation="1" floodColor="#171717" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>

      {/* Sparkle burst at the high five touch point when closed */}
      {isHighFiveTouching && (
        <div
          id="highfive-burst-indicator"
          className="absolute z-30 pointer-events-none transition-all duration-300 transform -translate-y-20 flex flex-col items-center animate-bounce"
        >
          <div className="bg-[#FFF0A5] text-[#171717] font-extrabold text-[11px] px-3 py-1 rounded-full border-2 border-[#171717] shadow-retro-sm whitespace-nowrap">
            👏 HIGH-FIVE LOCKED!
          </div>
          <svg className="w-8 h-8 text-[#FFF0A5] filter drop-shadow-sm mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#171717" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* Left Character (Dark tee, jeans, right arm extended) */}
      <div
        id="papercraft-character-left"
        style={{
          transform: `translateX(-${separationX}px)`,
          transition: 'transform 0.12s ease-out',
        }}
        onClick={onHighFiveTap}
        className="absolute z-10 w-[240px] sm:w-[290px] h-[460px] sm:h-[520px] flex items-center justify-center cursor-pointer group"
        title="Left Character - Paper-cut layered illustration"
      >
        <svg
          viewBox="0 0 260 480"
          className="w-full h-full filter"
          style={{ filter: 'url(#paper-sticker-shadow)' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ================= LAYER 0: THICK WHITE PAPER STICKER BACKING ================= */}
          <path
            d="M 68 50 C 60 45, 110 30, 142 46 C 160 55, 168 85, 160 115 C 165 125, 252 145, 254 185 C 255 205, 225 210, 162 178 C 160 195, 162 250, 155 255 C 162 280, 165 425, 155 450 C 148 468, 105 470, 95 448 C 88 410, 85 290, 80 270 C 70 290, 68 410, 58 450 C 48 468, 12 468, 8 448 C 2 410, 15 255, 25 220 C 15 195, 18 140, 30 115 C 28 85, 45 55, 68 50 Z"
            fill="#FFFFFF"
            stroke="#171717"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* ================= LAYER 1: LOWER BODY (DENIM JEANS) ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Denim Paper Base (#6380A5 - Muted Pastel Slate Blue) */}
            <path
              d="M 45 220 C 55 220, 135 220, 145 220 C 145 260, 152 385, 146 430 C 138 445, 106 445, 100 425 C 96 350, 94 285, 92 260 C 90 285, 88 350, 84 425 C 78 445, 46 445, 38 430 C 34 385, 38 260, 45 220 Z"
              fill="#6B88A8"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Denim Pocket & Fold Paper Accents */}
            <path d="M 52 230 Q 66 250 82 235" stroke="#4B637E" strokeWidth="2.5" fill="none" />
            <path d="M 108 235 Q 124 250 138 230" stroke="#4B637E" strokeWidth="2.5" fill="none" />
            <line x1="92" y1="220" x2="92" y2="260" stroke="#4B637E" strokeWidth="2.5" strokeDasharray="3 3" />
            {/* Baggy Paper Hem Folds */}
            <path d="M 38 425 C 50 420, 72 420, 84 425" stroke="#171717" strokeWidth="2" fill="none" />
            <path d="M 100 425 C 112 420, 134 420, 146 425" stroke="#171717" strokeWidth="2" fill="none" />
          </g>

          {/* Sneakers */}
          <g filter="url(#paper-micro-shadow)">
            <ellipse cx="61" cy="442" rx="24" ry="12" fill="#E8DEC8" stroke="#171717" strokeWidth="2.5" />
            <path d="M 45 442 Q 61 436 77 442" fill="#4B637E" stroke="#171717" strokeWidth="1.5" />
            <ellipse cx="123" cy="442" rx="24" ry="12" fill="#E8DEC8" stroke="#171717" strokeWidth="2.5" />
            <path d="M 107 442 Q 123 436 139 442" fill="#4B637E" stroke="#171717" strokeWidth="1.5" />
          </g>

          {/* ================= LAYER 2: EXTENDED ARM & HIGH-FIVE HAND ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Right Arm Reaching Out (Skin tone #FCE8DC) */}
            <path
              d="M 125 150 C 150 152, 215 162, 230 165 L 232 188 C 205 186, 140 180, 120 178 Z"
              fill="#F9D7C2"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* High Five Hand Palm (Centered near boundary) */}
            <path
              d="M 230 152 C 238 140, 244 140, 246 155 C 248 142, 253 142, 253 160 C 255 145, 259 148, 257 165 C 260 156, 263 158, 260 175 C 256 195, 245 198, 230 188 Z"
              fill="#F9D7C2"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* ================= LAYER 3: TORSO (BLACK TEE) ================= */}
          <g filter="url(#paper-layer-shadow)">
            <path
              d="M 50 142 C 65 136, 125 136, 140 142 C 145 165, 144 225, 140 230 C 115 233, 75 233, 50 230 C 46 220, 45 165, 50 142 Z"
              fill="#242424"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Left sleeve behind back */}
            <path d="M 50 142 L 35 175 L 48 185 L 56 155 Z" fill="#242424" stroke="#171717" strokeWidth="2.5" />
            {/* Right sleeve overlay */}
            <path d="M 135 142 L 152 165 L 140 178 L 126 154 Z" fill="#242424" stroke="#171717" strokeWidth="2.5" />
            {/* Crew Neck Collar */}
            <path d="M 80 140 Q 95 152 110 140" fill="none" stroke="#F9D7C2" strokeWidth="4" />
            <path d="M 80 140 Q 95 152 110 140" fill="none" stroke="#171717" strokeWidth="2" />
          </g>

          {/* ================= LAYER 4: HEAD, CUTE FACE & HAIR ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Neck */}
            <rect x="88" y="122" width="14" height="20" rx="4" fill="#F9D7C2" stroke="#171717" strokeWidth="2" />

            {/* Cute Rounded Face */}
            <ellipse cx="95" cy="98" rx="34" ry="38" fill="#FCE8DC" stroke="#171717" strokeWidth="2.5" />

            {/* Minimal Cute Facial Features: Dot Eyes & Blush Cheeks */}
            {/* Left Eye */}
            <circle cx="84" cy="95" r="3.5" fill="#171717" />
            {/* Right Eye */}
            <circle cx="106" cy="95" r="3.5" fill="#171717" />
            {/* Left Cheek Blush (Soft Pink Craft Foam) */}
            <ellipse cx="78" cy="105" rx="7" ry="4.5" fill="#F492A7" opacity="0.8" />
            {/* Right Cheek Blush */}
            <ellipse cx="112" cy="105" rx="7" ry="4.5" fill="#F492A7" opacity="0.8" />
            {/* Gentle Cute Mouth */}
            <path d="M 91 112 Q 95 116 99 112" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" />

            {/* Layered Sleek Hair Paper Cutout */}
            <path
              d="M 64 92 C 60 62, 85 46, 110 48 C 130 50, 138 68, 135 92 C 126 78, 115 72, 95 72 C 80 72, 70 80, 64 92 Z"
              fill="#242424"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Gentle Part Hair Tuft */}
            <path d="M 75 72 Q 88 82 82 92" stroke="#171717" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      {/* Right Character (Cream athletic jersey, curly hair, shorts, left arm extended) */}
      <div
        id="papercraft-character-right"
        style={{
          transform: `translateX(${separationX}px)`,
          transition: 'transform 0.12s ease-out',
        }}
        onClick={onHighFiveTap}
        className="absolute z-10 w-[240px] sm:w-[290px] h-[460px] sm:h-[520px] flex items-center justify-center cursor-pointer group"
        title="Right Character - Paper-cut layered illustration"
      >
        <svg
          viewBox="0 0 260 480"
          className="w-full h-full filter"
          style={{ filter: 'url(#paper-sticker-shadow)' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ================= LAYER 0: THICK WHITE PAPER STICKER BACKING ================= */}
          <path
            d="M 185 45 C 195 40, 140 25, 110 42 C 90 55, 80 85, 90 115 C 80 130, 8 152, 6 185 C 5 205, 35 210, 95 180 C 95 198, 92 250, 100 255 C 92 280, 88 425, 98 450 C 105 468, 145 470, 155 448 C 162 410, 168 290, 172 270 C 182 290, 185 410, 195 450 C 205 468, 240 468, 245 448 C 252 410, 238 255, 228 220 C 238 195, 235 140, 222 115 C 225 85, 208 55, 185 45 Z"
            fill="#FFFFFF"
            stroke="#171717"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* ================= LAYER 1: LOWER BODY (SHORTS & LEGS) ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Sports Shorts (#242424 with White Athletic Waves) */}
            <path
              d="M 110 220 C 125 220, 205 220, 220 220 C 224 250, 222 285, 215 295 C 198 298, 178 295, 172 278 C 166 295, 142 298, 125 295 C 118 285, 115 250, 110 220 Z"
              fill="#242424"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* White Athletic Side Wave Swirls */}
            <path d="M 120 280 Q 130 290 142 285" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <path d="M 210 280 Q 200 290 188 285" stroke="#FFFFFF" strokeWidth="3" fill="none" />

            {/* Athletic Legs (Skin #F9D7C2) */}
            <rect x="130" y="290" width="22" height="95" rx="8" fill="#F9D7C2" stroke="#171717" strokeWidth="2.5" />
            <rect x="185" y="290" width="22" height="95" rx="8" fill="#F9D7C2" stroke="#171717" strokeWidth="2.5" />

            {/* White Athletic Crew Socks */}
            <rect x="129" y="380" width="24" height="42" rx="4" fill="#FBF4E6" stroke="#171717" strokeWidth="2.5" />
            <line x1="129" y1="390" x2="153" y2="390" stroke="#7A1C2C" strokeWidth="2" />
            <rect x="184" y="380" width="24" height="42" rx="4" fill="#FBF4E6" stroke="#171717" strokeWidth="2.5" />
            <line x1="184" y1="390" x2="208" y2="390" stroke="#7A1C2C" strokeWidth="2" />

            {/* Sneakers */}
            <ellipse cx="140" cy="442" rx="22" ry="12" fill="#EAD9C0" stroke="#171717" strokeWidth="2.5" />
            <ellipse cx="196" cy="442" rx="22" ry="12" fill="#EAD9C0" stroke="#171717" strokeWidth="2.5" />
          </g>

          {/* ================= LAYER 2: EXTENDED LEFT ARM & HIGH-FIVE PALM ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Left Arm in Cream Long Sleeve (#FBF4E6) with Maroon Stripes */}
            <path
              d="M 125 152 C 95 154, 40 162, 25 168 L 24 190 C 45 186, 100 180, 122 178 Z"
              fill="#FBF4E6"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Maroon Athletic Stripes Down the Sleeve */}
            <path d="M 122 158 Q 70 166 28 174" stroke="#7A1C2C" strokeWidth="2" fill="none" />
            <path d="M 122 163 Q 70 171 28 179" stroke="#7A1C2C" strokeWidth="2" fill="none" />
            {/* Maroon Cuff */}
            <rect x="22" y="167" width="8" height="24" rx="2" fill="#7A1C2C" stroke="#171717" strokeWidth="1.5" />

            {/* High Five Hand Palm (Skin #F9D7C2) Touching Center */}
            <path
              d="M 24 154 C 18 142, 12 142, 10 156 C 8 143, 3 144, 3 162 C 1 147, -3 150, -1 166 C -4 158, -7 160, -4 176 C 0 196, 12 198, 24 188 Z"
              fill="#F9D7C2"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>

          {/* ================= LAYER 3: TORSO (CREAM & MAROON JERSEY) ================= */}
          <g filter="url(#paper-layer-shadow)">
            <path
              d="M 122 144 C 140 138, 205 138, 218 144 C 225 168, 222 225, 218 230 C 190 234, 150 234, 122 230 C 118 220, 116 168, 122 144 Z"
              fill="#FBF4E6"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Right hand casually resting in pocket */}
            <path d="M 218 144 L 234 175 L 222 198 L 210 180 Z" fill="#FBF4E6" stroke="#171717" strokeWidth="2.5" />
            <path d="M 220 152 Q 228 170 220 190" stroke="#7A1C2C" strokeWidth="2" fill="none" />

            {/* Maroon Ribbed Crew Collar */}
            <path d="M 152 142 Q 170 156 188 142" fill="none" stroke="#7A1C2C" strokeWidth="5" />
            <path d="M 152 142 Q 170 156 188 142" fill="none" stroke="#171717" strokeWidth="2" />

            {/* Soccer Crest Paper Badge */}
            <path d="M 148 165 L 158 165 L 158 174 L 153 178 L 148 174 Z" fill="#7A1C2C" stroke="#171717" strokeWidth="1.5" />
            {/* Red Trefoil Symbol */}
            <circle cx="192" cy="170" r="3.5" fill="#D33F49" stroke="#171717" strokeWidth="1" />
          </g>

          {/* ================= LAYER 4: HEAD, JOYFUL FACE & CURLY AFRO HAIR ================= */}
          <g filter="url(#paper-layer-shadow)">
            {/* Neck */}
            <rect x="162" y="122" width="16" height="22" rx="4" fill="#F9D7C2" stroke="#171717" strokeWidth="2" />

            {/* Cute Rounded Face */}
            <ellipse cx="170" cy="98" rx="34" ry="38" fill="#FCE8DC" stroke="#171717" strokeWidth="2.5" />

            {/* Minimal Cute Facial Features: Joyful Smile, Dot Eyes, Blush */}
            <circle cx="158" cy="95" r="3.5" fill="#171717" />
            <circle cx="182" cy="95" r="3.5" fill="#171717" />
            {/* Cheerful Blush Cheeks */}
            <ellipse cx="152" cy="105" rx="7" ry="4.5" fill="#F492A7" opacity="0.8" />
            <ellipse cx="188" cy="105" rx="7" ry="4.5" fill="#F492A7" opacity="0.8" />

            {/* Warm Wide Smile with White Teeth Cutout */}
            <path d="M 162 110 Q 170 122 178 110 Z" fill="#FFFFFF" stroke="#171717" strokeWidth="2" strokeLinejoin="round" />

            {/* Layered Curly Afro Cloud Hair (Papercraft Scalloped Edges) */}
            <path
              d="M 136 85 C 132 68, 140 50, 155 45 C 165 38, 178 38, 188 44 C 200 42, 210 52, 212 66 C 216 78, 212 92, 204 98 C 196 78, 175 70, 155 74 C 145 76, 138 82, 136 85 Z"
              fill="#242424"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Cute Scallop Curl Bumps */}
            <circle cx="148" cy="54" r="10" fill="#242424" stroke="#171717" strokeWidth="2" />
            <circle cx="170" cy="46" r="11" fill="#242424" stroke="#171717" strokeWidth="2" />
            <circle cx="192" cy="52" r="10" fill="#242424" stroke="#171717" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Decorative Graphic Fest Sparkle Stars around Stage */}
      <div className="absolute top-8 left-10 pointer-events-none hidden sm:block animate-pulse">
        <svg className="w-8 h-8 text-[#FFF0A5]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#171717" strokeWidth="1.8" />
        </svg>
      </div>
      <div className="absolute bottom-12 right-12 pointer-events-none hidden sm:block animate-pulse delay-300">
        <svg className="w-10 h-10 text-[#D8D0FF]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" stroke="#171717" strokeWidth="1.8" />
        </svg>
      </div>
    </div>
  );
};
