import { HandLandmarks, MultimodalState } from '../types';

// Standard MediaPipe 21 Hand Connections
const HAND_CONNECTIONS: [number, number][] = [
  // Palm base
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm bottom
];

export function renderVisionOverlay(
  canvas: HTMLCanvasElement,
  state: MultimodalState,
  viewWidth: number,
  viewHeight: number,
  isMirrored: boolean = true
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear previous frame
  ctx.clearRect(0, 0, viewWidth, viewHeight);

  // 1. Draw Face Box & Landmarks if active
  if (state.face.box) {
    const { x, y, width, height } = state.face.box;
    // Mirrored display calculation: raw camera x=0 is screen right when mirrored
    const px = isMirrored ? (1 - (x + width)) * viewWidth : x * viewWidth;
    const py = y * viewHeight;
    const pw = width * viewWidth;
    const ph = height * viewHeight;

    ctx.save();
    // Bounding Box with Cyan machine-vision style
    ctx.strokeStyle = '#2BD7D0';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(px, py, pw, ph);
    ctx.setLineDash([]);

    // Corner brackets
    const cornerLen = Math.min(pw, ph) * 0.2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2BD7D0';

    // Top-left
    ctx.beginPath();
    ctx.moveTo(px, py + cornerLen);
    ctx.lineTo(px, py);
    ctx.lineTo(px + cornerLen, py);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(px + pw - cornerLen, py);
    ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw, py + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(px, py + ph - cornerLen);
    ctx.lineTo(px, py + ph);
    ctx.lineTo(px + cornerLen, py + ph);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(px + pw - cornerLen, py + ph);
    ctx.lineTo(px + pw, py + ph);
    ctx.lineTo(px + pw, py + ph - cornerLen);
    ctx.stroke();

    // Face Tag Badge
    const tagWidth = Math.max(140, pw * 0.7);
    ctx.fillStyle = '#171717';
    ctx.fillRect(px, Math.max(4, py - 26), tagWidth, 22);
    ctx.fillStyle = '#2BD7D0';
    ctx.font = 'bold 11px "Space Grotesk", monospace';
    ctx.fillText(
      `FACE: ${state.face.dominantEmotion.toUpperCase()} (${Math.round(state.face.confidence * 100)}%)`,
      px + 8,
      Math.max(18, py - 11)
    );

    // Mouth State Indicator Box inside Face
    const mouthY = py + ph * 0.70;
    const mouthH = ph * 0.24;
    const mouthW = pw * 0.52;
    const mouthX = px + (pw - mouthW) / 2;

    ctx.strokeStyle = state.mouth.state === 'Closed' ? '#FFF0A5' : '#2BD7D0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mouthX, mouthY, mouthW, mouthH);

    ctx.fillStyle = '#171717';
    ctx.fillRect(mouthX, mouthY + mouthH + 2, mouthW, 16);
    ctx.fillStyle = state.mouth.state === 'Wide Open' ? '#2BD7D0' : '#FFF0A5';
    ctx.font = 'bold 10px "Space Grotesk", sans-serif';
    ctx.fillText(`MOUTH: ${state.mouth.state.toUpperCase()}`, mouthX + 4, mouthY + mouthH + 13);

    ctx.restore();
  }

  // 2. Draw Hand Skeleton & 21 Landmarks if active
  if (state.hand && state.hand.points.length >= 21) {
    drawHandSkeleton(ctx, state.hand, viewWidth, viewHeight, isMirrored);
  }

  // 3. Center crosshair reticle
  ctx.save();
  ctx.strokeStyle = 'rgba(43, 215, 208, 0.25)';
  ctx.lineWidth = 1;
  const cx = viewWidth / 2;
  const cy = viewHeight / 2;
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy);
  ctx.lineTo(cx + 14, cy);
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx, cy + 14);
  ctx.stroke();
  ctx.restore();
}

function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  hand: HandLandmarks,
  width: number,
  height: number,
  isMirrored: boolean
) {
  ctx.save();

  const getPtX = (p: { x: number }) => (isMirrored ? (1 - p.x) * width : p.x * width);
  const getPtY = (p: { y: number }) => p.y * height;

  // Draw Bones (Connections)
  ctx.strokeStyle = '#2BD7D0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const p1 = hand.points[startIdx];
    const p2 = hand.points[endIdx];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(getPtX(p1), getPtY(p1));
      ctx.lineTo(getPtX(p2), getPtY(p2));
      ctx.stroke();
    }
  });

  // Draw 21 Landmarks
  const tipIndices = [4, 8, 12, 16, 20];

  hand.points.forEach((point, idx) => {
    const px = getPtX(point);
    const py = getPtY(point);
    const isTip = tipIndices.includes(idx);
    const fingerIdx = tipIndices.indexOf(idx);
    const isRaised = fingerIdx >= 0 ? hand.raisedFingers[fingerIdx] : false;

    ctx.beginPath();
    ctx.arc(px, py, isTip ? 6 : 4, 0, Math.PI * 2);

    if (isTip) {
      ctx.fillStyle = isRaised ? '#2BD7D0' : '#E6A4C8';
      ctx.fill();
      ctx.strokeStyle = '#171717';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isRaised) {
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(43, 215, 208, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#171717';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Hand Badge over wrist
  const wrist = hand.points[0];
  if (wrist) {
    const wx = getPtX(wrist);
    const wy = getPtY(wrist);
    ctx.fillStyle = '#171717';
    ctx.fillRect(wx - 50, Math.min(height - 30, wy + 14), 100, 22);
    ctx.fillStyle = '#2BD7D0';
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${hand.fingerCount} FINGERS RAISED`, wx, Math.min(height - 15, wy + 29));
  }

  ctx.restore();
}
