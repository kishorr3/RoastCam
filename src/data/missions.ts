import { Mission, MultimodalState } from '../types';

export const MISSIONS: Mission[] = [
  {
    id: 'mission_happy',
    title: 'Mission 1: Pure Euphoria',
    instruction: 'Give us your happiest face (Smile big!)',
    badge: '😄',
    xp: 150,
    check: (s: MultimodalState) => s.face.dominantEmotion === 'Happy',
  },
  {
    id: 'mission_4fingers',
    title: 'Mission 2: Quad Digit Display',
    instruction: 'Hold up exactly 4 fingers to the camera',
    badge: '🖐️',
    xp: 200,
    check: (s: MultimodalState) => s.hand !== null && s.hand.fingerCount === 4,
  },
  {
    id: 'mission_close_mouth',
    title: 'Mission 3: Seal The Breach',
    instruction: 'Close your mouth completely',
    badge: '🤐',
    xp: 100,
    check: (s: MultimodalState) => s.mouth.state === 'Closed',
  },
  {
    id: 'mission_smile_4fingers',
    title: 'Mission 4: Multimodal Gymnastics',
    instruction: 'Smile while holding up 4 fingers',
    badge: '✨',
    xp: 350,
    check: (s: MultimodalState) =>
      s.face.dominantEmotion === 'Happy' &&
      s.hand !== null &&
      s.hand.fingerCount === 4,
  },
  {
    id: 'mission_surprise_2fingers_mouth',
    title: 'Mission 5: Anime Shockwave',
    instruction: 'Look surprised, open mouth & hold up 2 fingers (peace)',
    badge: '😲',
    xp: 450,
    check: (s: MultimodalState) =>
      (s.face.dominantEmotion === 'Surprise' || s.face.dominantEmotion === 'Fear') &&
      s.mouth.state !== 'Closed' &&
      s.hand !== null &&
      s.hand.fingerCount === 2,
  },
  {
    id: 'mission_highfive_5',
    title: 'Mission 6: Virtual High-Five',
    instruction: 'Hold up 5 fingers like a high-five with the crew',
    badge: '✋',
    xp: 300,
    check: (s: MultimodalState) => s.hand !== null && s.hand.fingerCount === 5,
  },
  {
    id: 'mission_neutral_stare',
    title: 'Mission 7: Stare Into The Void',
    instruction: 'Deadpan neutral stare (waiting for group partner reply)',
    badge: '😐',
    xp: 250,
    check: (s: MultimodalState) => s.face.dominantEmotion === 'Neutral',
  },
];
