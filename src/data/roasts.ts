import { EmotionType, FingerCount, MouthStateType, MultimodalState } from '../types';

export const EMOTION_ROASTS: Record<EmotionType, string[]> = {
  Happy: [
    "You're happy. That's probably going to change.",
    "Grinning at a camera? Bro has zero workload today.",
    "Smiling like you didn't miss three project deadlines.",
  ],
  Sad: [
    "You're sad. Unfortunately, we only detect it.",
    "Looking like your code crashed on line 1 in production.",
    "Sadness confirmed by AI. Refreshing the browser won't fix life.",
  ],
  Angry: [
    "You're angry. Punching the webcam won't help.",
    "Anger levels high. Did somebody mention a group project?",
    "Fuming at your monitor. The pixels are not intimidated.",
  ],
  Neutral: [
    "No emotion detected. Even your face gave up.",
    "Staring blankly. You look like you're waiting for a reply from Shamil or Nandakishor.",
    "Zero emotional data found. Are you a mannequin with Wi-Fi?",
  ],
  Surprise: [
    "You're surprised. We hope the reason was worth it.",
    "Mouth open, eyes wide. Did the React build actually compile without warnings?",
    "Astonished face logged. The machine vision is utterly unimpressed.",
  ],
  Fear: [
    "You're scared. Good. At least something is working.",
    "Horror detected. Did someone just invite you to a surprise standup meeting?",
    "Fearful expression. Don't worry, the useless AI only judges quietly.",
  ],
  Disgust: [
    "You look disgusted. Honestly, fair.",
    "Face scrunched up. Did you just read legacy JavaScript code?",
    "Visible disgust. We feel the exact same way about our workload.",
  ],
};

export const FINGER_ROASTS: Record<FingerCount, string[]> = {
  0: [
    "No fingers detected. What happened to your hand?",
    "Zero digits found. Are your hands hidden in your pockets like a suspect?",
  ],
  1: [
    "One finger. Please don't hurt yourself counting.",
    "Number one detected. You're definitely not number one in our hearts.",
  ],
  2: [
    "Two fingers. Bro discovered the number two.",
    "Peace sign attempt detected. World peace has not been achieved.",
  ],
  3: [
    "Three fingers. Absolutely nobody is impressed.",
    "Three fingers held high. You're running out of simple arithmetic.",
  ],
  4: [
    "Four fingers. One is clearly missing from the meeting.",
    "Flash 4 fingers if you are ready to start your gamified task manager.",
  ],
  5: [
    "Congratulations. You have a hand.",
    "Five fingers on display. Peak evolutionary demonstration right there.",
  ],
};

export const MOUTH_ROASTS: Record<MouthStateType, string[]> = {
  Closed: [
    "Mouth closed. Best decision you've made all day.",
    "Lips sealed tight. Please keep it that way for public safety.",
  ],
  'Slightly Open': [
    "Your mouth is leaking. Please close it.",
    "Mouth slightly open. Brain loading at 12% capacity.",
  ],
  'Wide Open': [
    "Close your mouth bro, we're detecting things we didn't ask for.",
    "Bro, your mouth is smelling. Please close it.",
    "Wide open jaw detected. Are you catching airborne Wi-Fi signals?",
  ],
};

export interface CombinedRoastRule {
  priority: number;
  match: (state: MultimodalState) => boolean;
  text: string;
}

export const COMBINED_ROAST_RULES: CombinedRoastRule[] = [
  {
    priority: 100,
    match: (s) =>
      s.face.dominantEmotion === 'Happy' &&
      s.hand?.fingerCount === 5 &&
      s.mouth.state !== 'Closed',
    text: 'Mouth smelling, hand functioning. At least one system works.',
  },
  {
    priority: 95,
    match: (s) =>
      s.face.dominantEmotion === 'Happy' &&
      (s.mouth.state === 'Slightly Open' || s.mouth.state === 'Wide Open'),
    text: "You're happy. Your mouth is also enjoying the freedom.",
  },
  {
    priority: 90,
    match: (s) =>
      s.face.dominantEmotion === 'Angry' && s.mouth.state !== 'Closed',
    text: 'Close your mouth before the argument starts.',
  },
  {
    priority: 85,
    match: (s) =>
      s.face.dominantEmotion === 'Sad' && s.mouth.state !== 'Closed',
    text: 'Sadness detected. Breath freshness also questionable.',
  },
  {
    priority: 80,
    match: (s) =>
      s.face.dominantEmotion === 'Happy' &&
      s.mouth.ratio > 0.35,
    text: 'Smile detected. Breath freshness: classified information.',
  },
  {
    priority: 75,
    match: (s) =>
      (!s.hand || s.hand.fingerCount === 0) &&
      (s.mouth.state === 'Wide Open' || s.mouth.state === 'Slightly Open'),
    text: 'Nothing in your hand, something definitely in your mouth.',
  },
  {
    priority: 70,
    match: (s) =>
      s.face.dominantEmotion === 'Surprise' &&
      s.mouth.state === 'Wide Open' &&
      s.hand?.fingerCount === 2,
    text: 'Shocked face and a peace sign? You look like an anime protagonist having an existential crisis.',
  },
  {
    priority: 65,
    match: (s) =>
      s.face.dominantEmotion === 'Neutral' &&
      (!s.hand || s.hand.fingerCount === 0),
    text: 'Neutral face check: Stare at the lens like you are waiting for a group project reply from Shamil or Nandakishor.',
  },
];

let lastRoastText = '';

export function getRoastForState(state: MultimodalState): { text: string; category: 'emotion' | 'finger' | 'mouth' | 'combined' } {
  // Check combined priority rules first
  for (const rule of COMBINED_ROAST_RULES) {
    if (rule.match(state)) {
      lastRoastText = rule.text;
      return { text: rule.text, category: 'combined' };
    }
  }

  // Mouth wide open takes strong comedic presence
  if (state.mouth.state === 'Wide Open') {
    const list = MOUTH_ROASTS['Wide Open'];
    const text = list[Math.floor(Math.random() * list.length)];
    lastRoastText = text;
    return { text, category: 'mouth' };
  }

  // If fingers are held up (1 to 5)
  if (state.hand && state.hand.fingerCount > 0) {
    const list = FINGER_ROASTS[state.hand.fingerCount];
    const available = list.filter((r) => r !== lastRoastText);
    const text = (available.length > 0 ? available : list)[Math.floor(Math.random() * (available.length || list.length))];
    lastRoastText = text;
    return { text, category: 'finger' };
  }

  // Fallback to dominant emotion roast
  const emotionList = EMOTION_ROASTS[state.face.dominantEmotion] || EMOTION_ROASTS.Neutral;
  const available = emotionList.filter((r) => r !== lastRoastText);
  const text = (available.length > 0 ? available : emotionList)[Math.floor(Math.random() * (available.length || emotionList.length))];
  lastRoastText = text;
  return { text, category: 'emotion' };
}
