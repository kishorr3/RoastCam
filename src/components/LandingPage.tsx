import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Shield, Cpu, Sliders, Volume2 } from 'lucide-react';
import { PapercraftHero } from './PapercraftHero';
import { OctopusMascot } from './OctopusMascot';
import { sound } from '../utils/soundEffects';

interface LandingPageProps {
  onStartExperience: () => void;
}

const ICEBREAKER_PROMPTS = [
  'Show us your face when your React build finally compiles without warnings.',
  'Hold up your fingers (0-5) to predict how many goals your football team will score this weekend.',
  'Give us your best "My ECE lab equipment actually worked on the first try" expression.',
  'Flash 4 fingers if you are ready to start your gamified task manager.',
  'Neutral face check: Stare at the lens like you are waiting for a group project reply from Shamil or Nandakishor.',
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartExperience }) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeIcebreakerIndex, setActiveIcebreakerIndex] = useState<number>(0);
  const [activeLang, setActiveLang] = useState<'ENG' | 'ROAST'>('ENG');

  // Cycle icebreakers every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcebreakerIndex((prev) => (prev + 1) % ICEBREAKER_PROMPTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Listen to scroll position to drive high-five separation animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 380;
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHighFiveTap = () => {
    sound.playHighFive();
    // Toggle between touching and separated if tapped
    setScrollProgress((prev) => (prev > 0.3 ? 0 : 0.75));
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#242424] text-[#171717] px-3 sm:px-6 py-6 font-sans-body">
      {/* Outer Graphic Fest Container Card */}
      <div className="max-w-6xl mx-auto bg-[#E6A4C8] rounded-3xl sm:rounded-[36px] border-dark-solid shadow-retro-lg p-4 sm:p-8 lg:p-10 relative overflow-hidden">
        
        {/* Subtle decorative craft paper texture background */}
        <div className="absolute inset-0 paper-texture opacity-60 pointer-events-none"></div>

        {/* Top Navigation Bar matching Graphic Fest Reference */}
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#171717] pb-5 mb-8">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center text-[#2BD7D0] shadow-retro-sm">
              <span className="font-pixel text-lg">R</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#171717] block leading-none">
                RoastCam
              </span>
              <span className="text-[10px] font-pixel text-[#171717]/80 uppercase tracking-widest">
                Useless AI • Built Well
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#171717]">
            <a href="#concept" className="hover:underline">Concept</a>
            <a href="#multimodal" className="hover:underline">Multimodal HCI</a>
            <a href="#privacy" className="hover:underline">Privacy (100% Local)</a>
          </nav>

          {/* Graphic Fest style pill toggles */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#FFFFFF] rounded-full p-1 border-2 border-[#171717] shadow-retro-sm text-xs font-bold">
              <button
                onClick={() => setActiveLang('ENG')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeLang === 'ENG'
                    ? 'bg-[#9A8CE6] text-[#FFFFFF]'
                    : 'text-[#171717] hover:text-black'
                }`}
              >
                ENG
              </button>
              <button
                onClick={() => setActiveLang('ROAST')}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeLang === 'ROAST'
                    ? 'bg-[#9A8CE6] text-[#FFFFFF]'
                    : 'text-[#171717] hover:text-black'
                }`}
              >
                ROAST
              </button>
            </div>

            {/* Direct Launch CTA */}
            <button
              id="header-start-experience-btn"
              onClick={() => {
                sound.playSnap();
                onStartExperience();
              }}
              className="bg-[#2BD7D0] hover:bg-[#22bfb8] text-[#171717] font-display font-black text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-[#171717] shadow-retro-sm flex items-center gap-1.5 transition-all hover:scale-105 active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>OPEN LAB</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </header>

        {/* Hero Section with Interactive High-Five Papercraft Art */}
        <section className="relative z-10 my-4 sm:my-8 text-center">
          {/* Tagline & Promise Banner */}
          <div className="inline-flex items-center gap-2 bg-[#FFF0A5] px-4 py-1.5 rounded-full border-2 border-[#171717] shadow-retro-sm text-xs font-bold text-[#171717] mb-6">
            <Sparkles size={14} className="text-[#9A8CE6]" />
            <span>&ldquo;Advanced AI. Completely unnecessary.&rdquo;</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#171717] tracking-tight leading-[1.05] max-w-4xl mx-auto uppercase">
            Computer Vision That Roasts Your Very Existence
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#171717]/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Real-time client-side face emotion, finger counting, and mouth aperture analysis,
            wrapped in a soft handcrafted paper-cut diorama world.
          </p>

          {/* Interactive Scrub Slider for the Two-Person High-Five Separation */}
          <div className="max-w-md mx-auto mt-6 bg-[#FFFFFF] rounded-2xl border-2 border-[#171717] shadow-retro-sm p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#171717]">
              <span className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#9A8CE6]" />
                <span>HIGH-FIVE SCRUBBER</span>
              </span>
              <span className="font-pixel text-[11px] bg-[#FFF0A5] px-2 py-0.5 rounded border border-[#171717]">
                {scrollProgress < 0.1 ? 'TOUCHING 👏' : `${Math.round(scrollProgress * 100)}% SEPARATED`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scrollProgress}
              onChange={(e) => setScrollProgress(parseFloat(e.target.value))}
              className="w-full accent-[#2BD7D0] cursor-pointer"
              title="Scrub to separate characters or scroll down"
            />
            <span className="text-[10px] text-[#666666]">
              Tip: Scroll down the page or drag slider to reveal the center corridor
            </span>
          </div>

          {/* Papercraft Diorama Stage */}
          <div className="relative mt-4">
            <PapercraftHero
              scrollProgress={scrollProgress}
              onHighFiveTap={handleHighFiveTap}
            />

            {/* Pixel-Art Mascot Crawling over stage */}
            <div className="absolute top-4 right-4 sm:right-12 z-30">
              <OctopusMascot
                reaction={scrollProgress < 0.1 ? 'celebrating' : 'idle'}
                customSpeech={scrollProgress < 0.1 ? 'High-five!' : null}
              />
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="start-experience-cta-btn"
              onClick={() => {
                sound.playHighFive();
                onStartExperience();
              }}
              className="w-full sm:w-auto bg-[#2BD7D0] hover:bg-[#20c2bc] text-[#171717] font-display font-black text-lg sm:text-xl px-8 py-4 rounded-2xl border-dark-solid shadow-retro hover:shadow-retro-lg transition-all hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-3"
            >
              <span>START EXPERIENCE</span>
              <ArrowRight size={22} className="stroke-[3]" />
            </button>
          </div>
        </section>

        {/* Dynamic Icebreaker Prompts Ticker from PDF Page 11 */}
        <section className="relative z-10 mt-8 mb-6">
          <div className="bg-[#FBF4E6] rounded-2xl border-2 border-[#171717] shadow-retro p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0A5] border-2 border-[#171717] flex items-center justify-center flex-shrink-0 text-sm shadow-retro-sm">
                💬
              </div>
              <div>
                <span className="text-[10px] font-pixel text-[#666666] uppercase block">
                  ICEBREAKER CHALLENGE #{activeIcebreakerIndex + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-[#171717] font-sans-body">
                  &ldquo;{ICEBREAKER_PROMPTS[activeIcebreakerIndex]}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playChirp();
                setActiveIcebreakerIndex((prev) => (prev + 1) % ICEBREAKER_PROMPTS.length);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-[#171717] bg-[#D8D0FF] hover:bg-[#c2b6fc] text-[#171717] shadow-retro-sm whitespace-nowrap"
            >
              Next Prompt ↻
            </button>
          </div>
        </section>

        {/* Three Pillar Cards: Architecture & Modalities */}
        <section id="multimodal" className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {/* Card 1: Face + Emotion */}
          <div className="bg-[#FBF4E6] rounded-2xl border-2 border-[#171717] shadow-retro p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E6A4C8] border-2 border-[#171717] flex items-center justify-center text-lg mb-3 shadow-retro-sm">
                😄
              </div>
              <h3 className="font-display font-extrabold text-lg text-[#171717] uppercase">
                01 / Emotion Vision
              </h3>
              <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                7-class softmax emotion classification (Happy, Sad, Angry, Neutral, Surprise, Fear, Disgust)
                computed directly in your browser.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#171717]/20 flex items-center justify-between text-[11px] font-bold">
              <span>Winning active state</span>
              <span className="text-[#2BD7D0] bg-[#171717] px-2 py-0.5 rounded">CYAN HIGHLIGHT</span>
            </div>
          </div>

          {/* Card 2: Hand + Finger Counting */}
          <div className="bg-[#D8D0FF] rounded-2xl border-2 border-[#171717] shadow-retro p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#FFF0A5] border-2 border-[#171717] flex items-center justify-center text-lg mb-3 shadow-retro-sm">
                ✋
              </div>
              <h3 className="font-display font-extrabold text-lg text-[#171717] uppercase">
                02 / Hand Skeleton
              </h3>
              <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                21 landmark coordinates, connective bones, and handedness-aware thumb rules
                that count digits from 0 to 5 in real time.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#171717]/20 flex items-center justify-between text-[11px] font-bold">
              <span>Digit classification</span>
              <span className="text-[#171717] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#171717]">0 - 5 FINGERS</span>
            </div>
          </div>

          {/* Card 3: Mouth Aperture & Spoken Audio */}
          <div className="bg-[#F3C8DE] rounded-2xl border-2 border-[#171717] shadow-retro p-5 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2BD7D0] border-2 border-[#171717] flex items-center justify-center text-lg mb-3 shadow-retro-sm">
                🗣️
              </div>
              <h3 className="font-display font-extrabold text-lg text-[#171717] uppercase">
                03 / Roast & Speech
              </h3>
              <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                Multi-signal fusion engine detects mouth state (Closed, Slightly Open, Wide Open)
                and speaks contextual roasts aloud using Web Speech API.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#171717]/20 flex items-center justify-between text-[11px] font-bold">
              <span>Spoken voice synthesis</span>
              <span className="text-[#171717] bg-[#FFF0A5] px-2 py-0.5 rounded border border-[#171717]">TTS ENABLED</span>
            </div>
          </div>
        </section>

        {/* Local AI Statement & Footer */}
        <footer id="privacy" className="relative z-10 mt-10 pt-6 border-t-2 border-[#171717] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#171717]">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#2BD7D0]" />
            <span>100% Client-Side Processing • No frames or audio ever leave your computer</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-pixel text-[#555555]">
            <span>ROASTCAM v1.0</span>
            <span>•</span>
            <span>USEFULNESS: 0%</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
