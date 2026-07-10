// Composes phone wallpapers from the user's own watch photo. Runs entirely
// client-side on canvas. No ctx.filter (unreliable on iOS Safari) — the blur
// is progressive downscale/upscale resampling, which is smooth everywhere.

export type PhotoLayout = 'showcase' | 'macro';

/** the dial circle in ORIGINAL image coordinates */
export type DialCrop = { cx: number; cy: number; r: number };

/** square source region around the circle, clamped inside the image */
function sourceSquare(img: HTMLImageElement, crop: DialCrop) {
  const size = Math.min(crop.r * 2, img.width, img.height);
  const half = size / 2;
  const x = Math.min(Math.max(crop.cx - half, 0), img.width - size);
  const y = Math.min(Math.max(crop.cy - half, 0), img.height - size);
  return { x, y, size };
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s: { x: number; y: number; size: number },
  w: number,
  h: number,
) {
  // cover-crop the square source onto a w x h canvas
  const scale = Math.max(w / s.size, h / s.size);
  const dw = s.size * scale;
  const dh = s.size * scale;
  ctx.drawImage(img, s.x, s.y, s.size, s.size, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** approximate a heavy gaussian blur by resampling down and back up */
function blurBackdrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s: { x: number; y: number; size: number },
  w: number,
  h: number,
) {
  const tiny = document.createElement('canvas');
  const tw = Math.max(8, Math.round(w / 40));
  const th = Math.max(16, Math.round(h / 40));
  tiny.width = tw;
  tiny.height = th;
  const tctx = tiny.getContext('2d')!;
  tctx.imageSmoothingEnabled = true;
  drawCover(tctx as unknown as CanvasRenderingContext2D, img, s, tw, th);

  // two-stage upscale smooths harder than one jump
  const mid = document.createElement('canvas');
  mid.width = tw * 6;
  mid.height = th * 6;
  const mctx = mid.getContext('2d')!;
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(tiny, 0, 0, mid.width, mid.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(mid, 0, 0, w, h);
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.hypot(w, h) / 2);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function composeWallpaper(
  img: HTMLImageElement,
  crop: DialCrop,
  layout: PhotoLayout,
  w: number,
  h: number,
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  const s = sourceSquare(img, crop);

  if (layout === 'macro') {
    drawCover(ctx, img, s, w, h);
    vignette(ctx, w, h, 0.38);
    return out;
  }

  // showcase: sharp dial disc floating on a blurred, darkened backdrop
  blurBackdrop(ctx, img, s, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.46)';
  ctx.fillRect(0, 0, w, h);

  const dcx = w / 2;
  const dcy = h * 0.52;
  const dr = w * 0.41;

  // soft halo shadow under the disc
  const halo = ctx.createRadialGradient(dcx, dcy + dr * 0.05, dr * 0.82, dcx, dcy + dr * 0.05, dr * 1.3);
  halo.addColorStop(0, 'rgba(0,0,0,0.55)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(dcx - dr * 1.4, dcy - dr * 1.4, dr * 2.8, dr * 2.8);

  ctx.save();
  ctx.beginPath();
  ctx.arc(dcx, dcy, dr, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, s.x, s.y, s.size, s.size, dcx - dr, dcy - dr, dr * 2, dr * 2);
  ctx.restore();

  // hairline rim catching light
  ctx.beginPath();
  ctx.arc(dcx, dcy, dr - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  ctx.stroke();

  vignette(ctx, w, h, 0.3);
  return out;
}

/** should the lock-screen clock use dark ink over this wallpaper? */
export function clockNeedsDarkInk(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')!;
  const y0 = Math.round(canvas.height * 0.05);
  const y1 = Math.round(canvas.height * 0.2);
  const data = ctx.getImageData(0, y0, canvas.width, y1 - y0).data;
  let sum = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return sum / n / 255 > 0.6;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not render the wallpaper.'))), type, quality),
  );
}
