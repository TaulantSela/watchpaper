// Single source of truth for dial-texture rendering. Palette-driven so the
// same families render the built-in dials, user photo-derived custom dials
// (client side), and server PNGs for the Shortcuts endpoint.

export const ART_W = 1320;
export const ART_H = 2868;

export type FamilyKey =
  | 'tapisserie'
  | 'stripes'
  | 'sunray'
  | 'lacquer'
  | 'snow'
  | 'grain'
  | 'guilloche';

/** 1-3 anchor colours, dark-to-light where it matters; families derive the rest. */
export type BaseColors = string[];

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** shift lightness: amt in [-1, 1]; negative darkens toward black, positive lightens toward white */
export function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (amt >= 0) {
    return rgbToHex({ r: r + (255 - r) * amt, g: g + (255 - g) * amt, b: b + (255 - b) * amt });
  }
  const k = 1 + amt;
  return rgbToHex({ r: r * k, g: g * k, b: b * k });
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// Deterministic PRNG so renders are reproducible everywhere.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RenderOptions = {
  /** cover-crop the master artboard to this output size */
  width?: number;
  height?: number;
};

function svgDoc(defs: string, body: string, opts?: RenderOptions): string {
  let dims = `width="${ART_W}" height="${ART_H}" viewBox="0 0 ${ART_W} ${ART_H}"`;
  if (opts?.width && opts?.height) {
    const s = Math.max(opts.width / ART_W, opts.height / ART_H);
    const vw = opts.width / s;
    const vh = opts.height / s;
    const x = (ART_W - vw) / 2;
    const y = (ART_H - vh) / 2;
    dims = `width="${opts.width}" height="${opts.height}" viewBox="${x.toFixed(2)} ${y.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}"`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" ${dims}>
<defs>${defs}</defs>
${body}
</svg>`;
}

function sheenAndVignette(
  id: string,
  {
    sheenOpacity = 0.1,
    sheenCx = 0.5,
    sheenCy = 0.36,
    sheenR = 0.75,
    vigOpacity = 0.34,
  }: { sheenOpacity?: number; sheenCx?: number; sheenCy?: number; sheenR?: number; vigOpacity?: number } = {},
) {
  const defs = `
  <radialGradient id="sheen-${id}" cx="${sheenCx}" cy="${sheenCy}" r="${sheenR}">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="${sheenOpacity}"/>
    <stop offset="55%" stop-color="#ffffff" stop-opacity="${(sheenOpacity * 0.35).toFixed(3)}"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig-${id}" cx="0.5" cy="0.5" r="0.72">
    <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="${vigOpacity}"/>
  </radialGradient>`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="url(#sheen-${id})"/>
  <rect width="${ART_W}" height="${ART_H}" fill="url(#vig-${id})"/>`;
  return { defs, body };
}

// ---------------------------------------------------------------------------
// Families
// ---------------------------------------------------------------------------

export type TapisseriePalette = {
  channel: string; bevelBottom: string; bevelTop: string; bevelLeft: string;
  bevelRight: string; top: string; topLit: string; topEdgeLight: string;
  smallSide: string; smallTop: string;
};

export function tapisseriePalette(base: string): TapisseriePalette {
  return {
    channel: shade(base, -0.78),
    bevelBottom: shade(base, -0.62),
    bevelTop: shade(base, 0.28),
    bevelLeft: shade(base, 0.1),
    bevelRight: shade(base, -0.48),
    top: base,
    topLit: shade(base, 0.12),
    topEdgeLight: shade(base, 0.5),
    smallSide: shade(base, -0.55),
    smallTop: shade(base, 0.08),
  };
}

function tapisserie(id: string, pal: TapisseriePalette, opts?: RenderOptions): string {
  const T = 150, C = 34, B = T - C, bw = 20, o = C / 2;
  const inner = B - 2 * bw, s = 32, sb = 7;

  const bigSquare = `
    <rect x="${o}" y="${o}" width="${B}" height="${B}" fill="${pal.bevelBottom}"/>
    <polygon points="${o},${o} ${o + B},${o} ${o + B - bw},${o + bw} ${o + bw},${o + bw}" fill="${pal.bevelTop}"/>
    <polygon points="${o},${o} ${o + bw},${o + bw} ${o + bw},${o + B - bw} ${o},${o + B}" fill="${pal.bevelLeft}"/>
    <polygon points="${o + B},${o} ${o + B},${o + B} ${o + B - bw},${o + B - bw} ${o + B - bw},${o + bw}" fill="${pal.bevelRight}"/>
    <rect x="${o + bw}" y="${o + bw}" width="${inner}" height="${inner}" fill="url(#topg-${id})"/>
    <rect x="${o + bw}" y="${o + bw}" width="${inner}" height="3.5" fill="${pal.topEdgeLight}" opacity="0.9"/>
    <rect x="${o + bw}" y="${o + bw}" width="3" height="${inner}" fill="${pal.topEdgeLight}" opacity="0.45"/>`;

  const small = (cx: number, cy: number) => `
    <rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="${pal.smallSide}"/>
    <rect x="${cx - s / 2 + sb}" y="${cy - s / 2 + sb}" width="${s - 2 * sb}" height="${s - 2 * sb}" fill="${pal.smallTop}"/>
    <rect x="${cx - s / 2 + sb}" y="${cy - s / 2 + sb}" width="${s - 2 * sb}" height="2" fill="${pal.topEdgeLight}" opacity="0.9"/>`;

  const fin = sheenAndVignette(id, { sheenOpacity: 0.12, vigOpacity: 0.38 });
  const defs = `
  <linearGradient id="topg-${id}" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="${pal.topLit}"/>
    <stop offset="100%" stop-color="${pal.top}"/>
  </linearGradient>
  <pattern id="tap-${id}" width="${T}" height="${T}" patternUnits="userSpaceOnUse">
    <rect width="${T}" height="${T}" fill="${pal.channel}"/>
    ${bigSquare}
    ${small(0, 0)}${small(T, 0)}${small(0, T)}${small(T, T)}
  </pattern>
  <linearGradient id="band-${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="42%" stop-color="#ffffff" stop-opacity="0.06"/>
    <stop offset="58%" stop-color="#ffffff" stop-opacity="0.06"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  ${fin.defs}`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="url(#tap-${id})"/>
  <rect width="${ART_W}" height="${ART_H}" fill="url(#band-${id})"/>
  ${fin.body}`;
  return svgDoc(defs, body, opts);
}

export type StripesPalette = {
  crest: string; hi: string; mid: string; low: string; deep: string; groove: string;
  grooveEnd?: string; glow: string;
};

export function stripesPalette(base: string): StripesPalette {
  return {
    crest: shade(base, 0.34), hi: shade(base, 0.14), mid: base,
    low: shade(base, -0.18), deep: shade(base, -0.5), groove: shade(base, -0.68),
    glow: shade(base, 0.42),
  };
}

function stripes(id: string, pal: StripesPalette, opts?: RenderOptions): string {
  const P = 94;
  const stripeRects: string[] = [];
  for (let y = 0; y < ART_H + P; y += P)
    stripeRects.push(`<rect x="0" y="${y}" width="${ART_W}" height="${P}" fill="url(#ridge-${id})"/>`);

  const rnd = mulberry32(42);
  const rays: string[] = [];
  const cx = ART_W / 2, cy = ART_H / 2, R = Math.hypot(ART_W, ART_H) / 2 + 80;
  for (let i = 0; i < 420; i++) {
    const a = rnd() * Math.PI * 2;
    const op = 0.012 + rnd() * 0.025;
    const col = rnd() > 0.5 ? '#ffffff' : '#000000';
    rays.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="${col}" stroke-opacity="${op.toFixed(3)}" stroke-width="${(1 + rnd() * 1.5).toFixed(1)}"/>`);
  }

  const defs = `
  <linearGradient id="ridge-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${pal.crest}"/>
    <stop offset="6%" stop-color="${pal.hi}"/>
    <stop offset="55%" stop-color="${pal.mid}"/>
    <stop offset="76%" stop-color="${pal.low}"/>
    <stop offset="86%" stop-color="${pal.deep}"/>
    <stop offset="94%" stop-color="${pal.groove}"/>
    <stop offset="100%" stop-color="${pal.grooveEnd ?? shade(pal.groove, 0.12)}"/>
  </linearGradient>
  <radialGradient id="raymask-${id}" cx="0.5" cy="0.5" r="0.7" gradientUnits="objectBoundingBox">
    <stop offset="0%" stop-color="#000000"/>
    <stop offset="18%" stop-color="#000000"/>
    <stop offset="42%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#ffffff"/>
  </radialGradient>
  <mask id="rm-${id}"><rect width="${ART_W}" height="${ART_H}" fill="url(#raymask-${id})"/></mask>
  <radialGradient id="fade-${id}" cx="0.5" cy="0.5" r="0.80">
    <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="42%" stop-color="#000000" stop-opacity="0.12"/>
    <stop offset="75%" stop-color="#000000" stop-opacity="0.52"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.90"/>
  </radialGradient>
  <radialGradient id="glow-${id}" cx="0.5" cy="0.46" r="0.5">
    <stop offset="0%" stop-color="${pal.glow}" stop-opacity="0.45"/>
    <stop offset="60%" stop-color="${pal.glow}" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="${pal.glow}" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="150"/>
  </filter>`;
  const R2 = Math.hypot(ART_W, ART_H) / 2 + 100;
  const wp = (a: number) => `${(cx + Math.cos(a) * R2).toFixed(1)},${(cy + Math.sin(a) * R2).toFixed(1)}`;
  const d2r = (d: number) => (d * Math.PI) / 180;
  const fan = (a0: number, a1: number, op: number) =>
    `<polygon points="${cx},${cy} ${wp(d2r(a0))} ${wp(d2r((a0 + a1) / 2))} ${wp(d2r(a1))}" fill="#BFE0D2" fill-opacity="${op}" filter="url(#soft-${id})"/>`;
  const body = `
  ${stripeRects.join('\n')}
  <g mask="url(#rm-${id})">${rays.join('')}</g>
  ${fan(-120, -60, 0.1)}
  ${fan(60, 120, 0.06)}
  <rect width="${ART_W}" height="${ART_H}" fill="url(#glow-${id})"/>
  <rect width="${ART_W}" height="${ART_H}" fill="url(#fade-${id})"/>`;
  return svgDoc(defs, body, opts);
}

export type SunrayPalette = { base: string; deep: string; hi: string; dark: string };

export function sunrayPalette(base: string): SunrayPalette {
  return { base, deep: shade(base, -0.42), hi: shade(base, 0.45), dark: shade(base, -0.72) };
}

function sunray(id: string, pal: SunrayPalette, seed: number, opts?: RenderOptions): string {
  const rnd = mulberry32(seed);
  const cx = ART_W / 2, cy = ART_H / 2, R = Math.hypot(ART_W, ART_H) / 2 + 100;
  const rays: string[] = [];
  for (let i = 0; i < 2600; i++) {
    const a = rnd() * Math.PI * 2;
    const op = 0.006 + rnd() * 0.022;
    const col = rnd() > 0.45 ? '#ffffff' : '#000000';
    rays.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="${col}" stroke-opacity="${op.toFixed(3)}" stroke-width="${(0.5 + rnd() * 0.7).toFixed(1)}"/>`);
  }
  const p = (a: number) => `${(cx + Math.cos(a) * R).toFixed(1)},${(cy + Math.sin(a) * R).toFixed(1)}`;
  const wedge = (a0: number, a1: number, col: string, op: number) =>
    `<polygon points="${cx},${cy} ${p(a0)} ${p((a0 + a1) / 2)} ${p(a1)}" fill="${col}" fill-opacity="${op}" filter="url(#soft-${id})"/>`;
  const d2r = (d: number) => (d * Math.PI) / 180;
  const defs = `
  <radialGradient id="base-${id}" cx="0.5" cy="0.5" r="0.95">
    <stop offset="0%" stop-color="${pal.base}"/>
    <stop offset="100%" stop-color="${pal.deep}"/>
  </radialGradient>
  <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="175"/>
  </filter>
  <radialGradient id="raymask-${id}" cx="0.5" cy="0.5" r="0.7" gradientUnits="objectBoundingBox">
    <stop offset="0%" stop-color="#000000"/>
    <stop offset="6%" stop-color="#000000"/>
    <stop offset="26%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#ffffff"/>
  </radialGradient>
  <mask id="rm-${id}"><rect width="${ART_W}" height="${ART_H}" fill="url(#raymask-${id})"/></mask>`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="url(#base-${id})"/>
  ${wedge(d2r(-128), d2r(-52), pal.hi, 0.28)}
  ${wedge(d2r(-108), d2r(-72), pal.hi, 0.22)}
  ${wedge(d2r(52), d2r(128), pal.hi, 0.24)}
  ${wedge(d2r(72), d2r(108), pal.hi, 0.18)}
  ${wedge(d2r(-20), d2r(20), pal.dark, 0.22)}
  ${wedge(d2r(160), d2r(200), pal.dark, 0.22)}
  <g mask="url(#rm-${id})">${rays.join('')}</g>`;
  return svgDoc(defs, body, opts);
}

export type LacquerPalette = { top: string; mid: string; bottom: string };

export function lacquerPalette(base: string): LacquerPalette {
  return { top: shade(base, 0.14), mid: base, bottom: shade(base, -0.14) };
}

function lacquer(id: string, pal: LacquerPalette, opts?: RenderOptions): string {
  const fin = sheenAndVignette(id, { sheenOpacity: 0.16, sheenCy: 0.3, vigOpacity: 0.22 });
  const defs = `
  <linearGradient id="lac-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${pal.top}"/>
    <stop offset="50%" stop-color="${pal.mid}"/>
    <stop offset="100%" stop-color="${pal.bottom}"/>
  </linearGradient>
  <filter id="grain-${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0"/>
  </filter>
  ${fin.defs}`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="url(#lac-${id})"/>
  <rect width="${ART_W}" height="${ART_H}" filter="url(#grain-${id})"/>
  ${fin.body}`;
  return svgDoc(defs, body, opts);
}

export type SnowPalette = {
  base: string;
  shadow: string;
  /** explicit feComponentTransfer tables (R, G, B), for byte-faithful built-ins */
  tables?: [string, string, string];
};

export function snowPalette(base: string): SnowPalette {
  const c = hexToRgb(base);
  const t = (v: number) => Math.min(1, v).toFixed(3);
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  return {
    base,
    shadow: shade(base, -0.16),
    tables: [
      `${t(r * 0.75)} ${t(r * 0.87)} ${t(r + 0.065)}`,
      `${t(g * 0.75)} ${t(g * 0.87)} ${t(g + 0.065)}`,
      `${t(b * 0.75 + 0.05)} ${t(b * 0.87 + 0.03)} ${t(b + 0.05)}`,
    ],
  };
}

function snow(id: string, pal: SnowPalette, opts?: RenderOptions): string {
  const rnd = mulberry32(77);
  const glints: string[] = [];
  for (let i = 0; i < 160; i++) {
    glints.push(`<circle cx="${(rnd() * ART_W).toFixed(0)}" cy="${(rnd() * ART_H).toFixed(0)}" r="${(0.7 + rnd() * 1.0).toFixed(1)}" fill="#ffffff" fill-opacity="${(0.2 + rnd() * 0.35).toFixed(2)}"/>`);
  }
  const tables = pal.tables ?? snowPalette(pal.base).tables!;
  const defs = `
  <filter id="snow-${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.011" numOctaves="5" seed="7" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="5.5" diffuseConstant="1.15" result="light">
      <feDistantLight azimuth="235" elevation="42"/>
    </feDiffuseLighting>
    <feComponentTransfer in="light" result="tone">
      <feFuncR type="table" tableValues="${tables[0]}"/>
      <feFuncG type="table" tableValues="${tables[1]}"/>
      <feFuncB type="table" tableValues="${tables[2]}"/>
    </feComponentTransfer>
  </filter>
  <filter id="micro-${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0"/>
  </filter>
  <radialGradient id="vig-${id}" cx="0.5" cy="0.5" r="0.78">
    <stop offset="0%" stop-color="${pal.shadow}" stop-opacity="0"/>
    <stop offset="72%" stop-color="${pal.shadow}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${pal.shadow}" stop-opacity="0.22"/>
  </radialGradient>`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="${pal.base}"/>
  <rect width="${ART_W}" height="${ART_H}" filter="url(#snow-${id})"/>
  <rect width="${ART_W}" height="${ART_H}" filter="url(#micro-${id})"/>
  <g>${glints.join('')}</g>
  <rect width="${ART_W}" height="${ART_H}" fill="url(#vig-${id})"/>`;
  return svgDoc(defs, body, opts);
}

export type GrainPalette = { base: string; ringLight: string };

export function grainPalette(base: string): GrainPalette {
  return { base, ringLight: shade(base, 0.18) };
}

function grain(id: string, pal: GrainPalette, opts?: RenderOptions): string {
  const cx = ART_W / 2, cy = ART_H / 2, stepR = 990;
  const defs = `
  <filter id="grain-${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="21" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.97  0 0 0 0.05 0"/>
  </filter>`;
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="${pal.base}"/>
  <path d="M0 0 H${ART_W} V${ART_H} H0 Z M${cx + stepR} ${cy} A${stepR} ${stepR} 0 1 0 ${cx - stepR} ${cy} A${stepR} ${stepR} 0 1 0 ${cx + stepR} ${cy} Z" fill="#000000" fill-opacity="0.12" fill-rule="evenodd"/>
  <circle cx="${cx}" cy="${cy}" r="${stepR}" fill="none" stroke="#0A0A0A" stroke-opacity="0.75" stroke-width="7"/>
  <circle cx="${cx}" cy="${cy}" r="${stepR + 6}" fill="none" stroke="${pal.ringLight}" stroke-opacity="0.7" stroke-width="2.5"/>
  <rect width="${ART_W}" height="${ART_H}" filter="url(#grain-${id})"/>`;
  return svgDoc(defs, body, opts);
}

export type GuillochePalette = { base: string; strokeDark: string; strokeLight: string };

export function guillochePalette(base: string): GuillochePalette {
  return { base, strokeDark: shade(base, -0.17), strokeLight: shade(base, 0.55) };
}

function guilloche(id: string, pal: GuillochePalette, opts?: RenderOptions): string {
  const cx = ART_W / 2, cy = ART_H / 2;
  const rings: string[] = [];
  const maxR = Math.hypot(ART_W, ART_H) / 2 + 60;
  let k = 0;
  for (let r0 = 14; r0 < maxR; r0 += 13, k++) {
    const amp = 3.2 + r0 * 0.0012;
    const waves = 18;
    const phase = r0 * 0.022;
    const pts: string[] = [];
    const steps = 360;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r = r0 + amp * Math.sin(waves * th + phase);
      pts.push(`${(cx + r * Math.cos(th)).toFixed(1)},${(cy + r * Math.sin(th)).toFixed(1)}`);
    }
    const col = k % 2 === 0 ? pal.strokeDark : pal.strokeLight;
    rings.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="1.8" stroke-opacity="0.9"/>`);
  }
  const fin = sheenAndVignette(id, { sheenOpacity: 0.2, sheenCy: 0.32, vigOpacity: 0.16 });
  const body = `
  <rect width="${ART_W}" height="${ART_H}" fill="${pal.base}"/>
  <g>${rings.join('\n')}</g>
  ${fin.body}`;
  return svgDoc(fin.defs, body, opts);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Render any family from 1-3 base colours (photo-derived custom dials). */
export function renderFamily(
  family: FamilyKey,
  colors: BaseColors,
  opts?: RenderOptions,
): string {
  const base = colors[0] ?? '#16324F';
  const id = 'c';
  switch (family) {
    case 'tapisserie':
      return tapisserie(id, tapisseriePalette(base), opts);
    case 'stripes':
      return stripes(id, stripesPalette(base), opts);
    case 'sunray':
      return sunray(id, sunrayPalette(base), 101, opts);
    case 'lacquer':
      return lacquer(id, lacquerPalette(base), opts);
    case 'snow':
      return snow(id, snowPalette(base), opts);
    case 'grain':
      return grain(id, grainPalette(base), opts);
    case 'guilloche':
      return guilloche(id, guillochePalette(base), opts);
  }
}

// Exact palettes for the built-in dials (identical to the original design study).
const TAP_BLUE: TapisseriePalette = {
  channel: '#040C18', bevelBottom: '#081627', bevelTop: '#33597A', bevelLeft: '#224260',
  bevelRight: '#0C2036', top: '#152F4B', topLit: '#1E3D5E', topEdgeLight: '#5580A8',
  smallSide: '#0A1B2E', smallTop: '#1F3F60',
};
const TAP_GREEN: TapisseriePalette = {
  channel: '#030F09', bevelBottom: '#071B12', bevelTop: '#347052', bevelLeft: '#215538',
  bevelRight: '#0A2418', top: '#123F29', topLit: '#1A4F35', topEdgeLight: '#579A75',
  smallSide: '#081F14', smallTop: '#1D5236',
};
const TAP_BLACK: TapisseriePalette = {
  channel: '#040405', bevelBottom: '#0A0A0C', bevelTop: '#404047', bevelLeft: '#2A2A30',
  bevelRight: '#101013', top: '#191920', topLit: '#212129', topEdgeLight: '#5E5E66',
  smallSide: '#0C0C0E', smallTop: '#26262D',
};
const NAUTILUS: StripesPalette = {
  crest: '#37587A', hi: '#2A4767', mid: '#233D5A', low: '#1E364F',
  deep: '#132639', groove: '#0A1626', grooveEnd: '#0D1B2E', glow: '#3D6B8F',
};
const HULK: SunrayPalette = { base: '#143723', deep: '#0A2013', hi: '#3CA463', dark: '#02120A' };
const DJ_BLUE: SunrayPalette = { base: '#587699', deep: '#455F7E', hi: '#C3D5E8', dark: '#2A3542' };
const OP_TURQ: LacquerPalette = { top: '#4EBFCB', mid: '#33A9B7', bottom: '#2795A3' };
const SNOWFLAKE: SnowPalette = {
  base: '#EAEDEE',
  shadow: '#AFB8C0',
  tables: ['0.68 0.80 0.985', '0.71 0.82 0.985', '0.76 0.85 0.98'],
};
const SPEEDY: GrainPalette = { base: '#1B1B1A', ringLight: '#3A3A37' };
const GUILLOCHE_SILVER: GuillochePalette = { base: '#DDDDD6', strokeDark: '#B7B7AF', strokeLight: '#F4F4EF' };

/** Render a built-in dial by slug, byte-faithful to the shipped SVGs. */
export function renderBuiltin(slug: string, opts?: RenderOptions): string | null {
  switch (slug) {
    case 'octagon-bleu': return tapisserie('tb', TAP_BLUE, opts);
    case 'octagon-vert': return tapisserie('tg', TAP_GREEN, opts);
    case 'octagon-noir': return tapisserie('tk', TAP_BLACK, opts);
    case 'porthole-blue': return stripes('nb', NAUTILUS, opts);
    case 'emerald-sunray': return sunray('sh', HULK, 101, opts);
    case 'azzurro-sunray': return sunray('sd', DJ_BLUE, 202, opts);
    case 'turquoise-lacquer': return lacquer('ot', OP_TURQ, opts);
    case 'first-snow': return snow('sf', SNOWFLAKE, opts);
    case 'moondust': return grain('sp', SPEEDY, opts);
    case 'flinque-argent': return guilloche('gs', GUILLOCHE_SILVER, opts);
    default: return null;
  }
}

export const FAMILIES: Array<{ key: FamilyKey; label: string; hint: string }> = [
  { key: 'sunray', label: 'Sunray', hint: 'radial brushing, angular light' },
  { key: 'lacquer', label: 'Lacquer', hint: 'flat gloss colour' },
  { key: 'tapisserie', label: 'Tapisserie', hint: 'waffle guilloché squares' },
  { key: 'stripes', label: 'Embossed bars', hint: 'horizontal ridges, dark rim' },
  { key: 'snow', label: 'Snow relief', hint: 'soft silvered drifts' },
  { key: 'grain', label: 'Matte grain', hint: 'eggshell charcoal, step ring' },
  { key: 'guilloche', label: 'Engine turning', hint: 'wavy concentric rings' },
];
