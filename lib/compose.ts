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

type Drawable = HTMLImageElement | HTMLCanvasElement;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: Drawable,
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
  img: Drawable,
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

/**
 * Reconstructs the bare dial surface: hands, printing, markers and subdials
 * are detected as outliers against the per-radius median colour (a dial is
 * rotationally self-similar along any radius) and refilled by sampling the
 * same radius at clean angles. Radial gradients and sunburst textures survive.
 * Returns a square canvas with the cleaned disc; pixels outside the circle
 * are transparent.
 */
export function cleanDialDisc(img: HTMLImageElement, crop: DialCrop, size = 1024): HTMLCanvasElement {
  const s = sourceSquare(img, crop);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, s.x, s.y, s.size, s.size, 0, 0, size, size);

  const image = ctx.getImageData(0, 0, size, size);
  const px = image.data;
  const c = size / 2;
  const maxR = size / 2;
  const NB = 160;
  const binOf = new Int16Array(size * size).fill(-1);

  // pass 1: bin every pixel by radius, sample colours per bin for stats
  const samples: number[][][] = Array.from({ length: NB }, () => []);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.hypot(x - c, y - c);
      if (r > maxR) continue;
      const b = Math.min(NB - 1, Math.floor((r / maxR) * NB));
      const idx = y * size + x;
      binOf[idx] = b;
      if ((x & 1) === 0 && (y & 1) === 0) {
        const i = idx * 4;
        samples[b].push([px[i], px[i + 1], px[i + 2]]);
      }
    }
  }

  const median = (arr: number[]) => {
    const a = [...arr].sort((p, q) => p - q);
    return a[a.length >> 1] ?? 0;
  };
  const med: number[][] = [];
  const madSum: number[] = [];
  for (let b = 0; b < NB; b++) {
    const chan = [0, 1, 2].map((ch) => samples[b].map((s0) => s0[ch]));
    const m = chan.map((v) => median(v));
    const mads = chan.map((v, ch) => median(v.map((x) => Math.abs(x - m[ch]))));
    med.push(m);
    madSum.push(mads[0] + mads[1] + mads[2]);
  }
  // the hands' pivot dominates the innermost radii — its own colour becomes the
  // median there, so borrow stats from a ring safely outside the pivot
  // pivot + dense hand cluster can dominate every angle out to ~1/7 of the
  // radius (the framing circle is usually tighter than the dial), so all
  // central bins take their statistics from a ring safely outside that zone
  const inner = Math.floor(NB * 0.18);
  for (let b = 0; b < Math.floor(NB * 0.14); b++) {
    med[b] = med[inner];
    madSum[b] = madSum[inner];
  }

  // pass 2: mask outliers, collect inlier indices per bin
  const mask = new Uint8Array(size * size);
  const inliers: number[][] = Array.from({ length: NB }, () => []);
  for (let idx = 0; idx < size * size; idx++) {
    const b = binOf[idx];
    if (b < 0) continue;
    const i = idx * 4;
    const m = med[b];
    const dev = Math.abs(px[i] - m[0]) + Math.abs(px[i + 1] - m[1]) + Math.abs(px[i + 2] - m[2]);
    const thr = Math.max(42, 4.5 * madSum[b]);
    if (dev > thr) mask[idx] = 1;
    else inliers[b].push(idx);
  }

  // pass 3: refill masked pixels from clean pixels at the same radius
  // fully-occluded radii (the hands' pivot covers every angle near the centre)
  // must borrow texture from further out, so search a wide bin neighbourhood
  const pick = (b: number): number[] | null => {
    for (let d = 0; d < 32; d++) {
      const off = d % 2 ? (d >> 1) + 1 : -((d >> 1) + 1);
      const lo = inliers[Math.max(0, Math.min(NB - 1, d === 0 ? b : b + off))];
      if (lo && lo.length > 8) return lo;
    }
    return null;
  };
  for (let idx = 0; idx < size * size; idx++) {
    if (!mask[idx]) continue;
    const pool = pick(binOf[idx]);
    if (!pool) continue;
    let r = 0, g = 0, bl = 0;
    const N = 6;
    for (let k = 0; k < N; k++) {
      const j = pool[(Math.random() * pool.length) | 0] * 4;
      r += px[j];
      g += px[j + 1];
      bl += px[j + 2];
    }
    const i = idx * 4;
    px[i] = r / N;
    px[i + 1] = g / N;
    px[i + 2] = bl / N;
  }
  ctx.putImageData(image, 0, 0);

  // feather the refilled regions so patch noise doesn't read as speckle:
  // blur the whole disc cheaply, then composite it back only where masked
  const soft = document.createElement('canvas');
  soft.width = size / 4;
  soft.height = size / 4;
  const sctx = soft.getContext('2d')!;
  sctx.drawImage(canvas, 0, 0, soft.width, soft.height);
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = size;
  maskCanvas.height = size;
  const mctx = maskCanvas.getContext('2d')!;
  mctx.drawImage(soft, 0, 0, size, size);
  const blurred = mctx.getImageData(0, 0, size, size);
  const bp = blurred.data;
  const final = ctx.getImageData(0, 0, size, size);
  const fp = final.data;
  for (let idx = 0; idx < size * size; idx++) {
    if (!mask[idx]) continue;
    const i = idx * 4;
    fp[i] = fp[i] * 0.45 + bp[i] * 0.55;
    fp[i + 1] = fp[i + 1] * 0.45 + bp[i + 1] * 0.55;
    fp[i + 2] = fp[i + 2] * 0.45 + bp[i + 2] * 0.55;
  }
  ctx.putImageData(final, 0, 0);

  // transparent outside the disc
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(c, c, maxR - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}

export function composeWallpaper(
  img: HTMLImageElement,
  crop: DialCrop,
  layout: PhotoLayout,
  w: number,
  h: number,
  cleaned?: HTMLCanvasElement | null,
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  const s = sourceSquare(img, crop);
  // when a cleaned disc is supplied, its inscribed square is the texture source
  const src: Drawable = cleaned ?? img;
  const inset = cleaned ? (cleaned.width - cleaned.width / Math.SQRT2) / 2 : 0;
  const sq = cleaned
    ? { x: inset, y: inset, size: cleaned.width / Math.SQRT2 }
    : s;

  if (layout === 'macro') {
    drawCover(ctx, src, sq, w, h);
    vignette(ctx, w, h, 0.38);
    return out;
  }

  // showcase: sharp dial disc floating on a blurred, darkened backdrop
  blurBackdrop(ctx, src, sq, w, h);
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
  if (cleaned) {
    ctx.drawImage(cleaned, 0, 0, cleaned.width, cleaned.height, dcx - dr, dcy - dr, dr * 2, dr * 2);
  } else {
    ctx.drawImage(img, s.x, s.y, s.size, s.size, dcx - dr, dcy - dr, dr * 2, dr * 2);
  }
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
