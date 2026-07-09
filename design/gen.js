// WatchPaper — parametric SVG generators for famous watch dial textures.
// Canvas: 1320 x 2868 (iPhone 16 Pro Max), scales to any phone via viewBox.
const fs = require('fs');
const path = require('path');

const W = 1320, H = 2868;
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

// Deterministic PRNG so renders are reproducible between runs.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function svgDoc(defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}</defs>
${body}
</svg>`;
}

// Shared finishing overlays: a soft light sheen + edge vignette.
function sheenAndVignette(id, { sheenOpacity = 0.10, sheenCx = 0.5, sheenCy = 0.36, sheenR = 0.75, vigOpacity = 0.34 } = {}) {
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
  <rect width="${W}" height="${H}" fill="url(#sheen-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#vig-${id})"/>`;
  return { defs, body };
}

// ---------------------------------------------------------------------------
// 1. Grande Tapisserie (AP Royal Oak) — waffle of flat-topped truncated
//    pyramids, channels between, small raised square at each intersection.
// ---------------------------------------------------------------------------
function tapisserie(id, pal) {
  const T = 150;            // tile pitch
  const C = 34;             // channel width
  const B = T - C;          // big square outer size
  const bw = 20;            // bevel width
  const o = C / 2;          // big square offset in tile
  const inner = B - 2 * bw; // flat top size
  const s = 32;             // small square size (at intersections)
  const sb = 7;             // small square bevel

  // Big square: channel floor is tile background; four bevel trapezoids; flat top.
  const bigSquare = `
    <rect x="${o}" y="${o}" width="${B}" height="${B}" fill="${pal.bevelBottom}"/>
    <polygon points="${o},${o} ${o + B},${o} ${o + B - bw},${o + bw} ${o + bw},${o + bw}" fill="${pal.bevelTop}"/>
    <polygon points="${o},${o} ${o + bw},${o + bw} ${o + bw},${o + B - bw} ${o},${o + B}" fill="${pal.bevelLeft}"/>
    <polygon points="${o + B},${o} ${o + B},${o + B} ${o + B - bw},${o + B - bw} ${o + B - bw},${o + bw}" fill="${pal.bevelRight}"/>
    <rect x="${o + bw}" y="${o + bw}" width="${inner}" height="${inner}" fill="url(#topg-${id})"/>
    <rect x="${o + bw}" y="${o + bw}" width="${inner}" height="3.5" fill="${pal.topEdgeLight}" opacity="0.9"/>
    <rect x="${o + bw}" y="${o + bw}" width="3" height="${inner}" fill="${pal.topEdgeLight}" opacity="0.45"/>`;

  // Small raised squares at the four tile corners (pattern tiling completes them).
  const small = (cx, cy) => `
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
  <rect width="${W}" height="${H}" fill="url(#tap-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#band-${id})"/>
  ${fin.body}`;
  return svgDoc(defs, body);
}

const TAP_BLUE = {
  channel: '#040C18', bevelBottom: '#081627', bevelTop: '#33597A', bevelLeft: '#224260',
  bevelRight: '#0C2036', top: '#152F4B', topLit: '#1E3D5E', topEdgeLight: '#5580A8',
  smallSide: '#0A1B2E', smallTop: '#1F3F60',
};
const TAP_GREEN = {
  channel: '#030F09', bevelBottom: '#071B12', bevelTop: '#347052', bevelLeft: '#215538',
  bevelRight: '#0A2418', top: '#123F29', topLit: '#1A4F35', topEdgeLight: '#579A75',
  smallSide: '#081F14', smallTop: '#1D5236',
};
const TAP_BLACK = {
  channel: '#040405', bevelBottom: '#0A0A0C', bevelTop: '#404047', bevelLeft: '#2A2A30',
  bevelRight: '#101013', top: '#191920', topLit: '#212129', topEdgeLight: '#5E5E66',
  smallSide: '#0C0C0E', smallTop: '#26262D',
};

// ---------------------------------------------------------------------------
// 2. Nautilus — horizontal embossed ridges, blue fading to black at edges.
// ---------------------------------------------------------------------------
function nautilus(id) {
  const P = 94; // ridge pitch -> ~30 bars (per spec: 28-32)
  const stripes = [];
  for (let y = 0; y < H + P; y += P) stripes.push(`<rect x="0" y="${y}" width="${W}" height="${P}" fill="url(#ridge-${id})"/>`);

  // faint sunray satin over the ridges, masked away from center
  const rnd = mulberry32(42);
  const rays = [];
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2 + 80;
  for (let i = 0; i < 420; i++) {
    const a = rnd() * Math.PI * 2;
    const op = 0.012 + rnd() * 0.025;
    const col = rnd() > 0.5 ? '#ffffff' : '#000000';
    rays.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="${col}" stroke-opacity="${op.toFixed(3)}" stroke-width="${(1 + rnd() * 1.5).toFixed(1)}"/>`);
  }

  const defs = `
  <linearGradient id="ridge-${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#37587A"/>
    <stop offset="6%" stop-color="#2A4767"/>
    <stop offset="55%" stop-color="#233D5A"/>
    <stop offset="76%" stop-color="#1E364F"/>
    <stop offset="86%" stop-color="#132639"/>
    <stop offset="94%" stop-color="#0A1626"/>
    <stop offset="100%" stop-color="#0D1B2E"/>
  </linearGradient>
  <radialGradient id="raymask-${id}" cx="0.5" cy="0.5" r="0.7" gradientUnits="objectBoundingBox">
    <stop offset="0%" stop-color="#000000"/>
    <stop offset="18%" stop-color="#000000"/>
    <stop offset="42%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#ffffff"/>
  </radialGradient>
  <mask id="rm-${id}"><rect width="${W}" height="${H}" fill="url(#raymask-${id})"/></mask>
  <radialGradient id="fade-${id}" cx="0.5" cy="0.5" r="0.80">
    <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="42%" stop-color="#000000" stop-opacity="0.12"/>
    <stop offset="75%" stop-color="#000000" stop-opacity="0.52"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.90"/>
  </radialGradient>
  <radialGradient id="glow-${id}" cx="0.5" cy="0.46" r="0.5">
    <stop offset="0%" stop-color="#3D6B8F" stop-opacity="0.45"/>
    <stop offset="60%" stop-color="#3D6B8F" stop-opacity="0.15"/>
    <stop offset="100%" stop-color="#3D6B8F" stop-opacity="0"/>
  </radialGradient>
  <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="150"/>
  </filter>`;
  // faint fan highlight from the sunburst satin — greenish glint per spec
  const cx2 = W / 2, cy2 = H / 2, R2 = Math.hypot(W, H) / 2 + 100;
  const wp = (a) => `${(cx2 + Math.cos(a) * R2).toFixed(1)},${(cy2 + Math.sin(a) * R2).toFixed(1)}`;
  const d2r = (d) => (d * Math.PI) / 180;
  const fan = (a0, a1, op) => `<polygon points="${cx2},${cy2} ${wp(d2r(a0))} ${wp(d2r((a0 + a1) / 2))} ${wp(d2r(a1))}" fill="#BFE0D2" fill-opacity="${op}" filter="url(#soft-${id})"/>`;
  const body = `
  ${stripes.join('\n')}
  <g mask="url(#rm-${id})">${rays.join('')}</g>
  ${fan(-120, -60, 0.10)}
  ${fan(60, 120, 0.06)}
  <rect width="${W}" height="${H}" fill="url(#glow-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#fade-${id})"/>`;
  return svgDoc(defs, body);
}

// ---------------------------------------------------------------------------
// 3. Sunburst (Submariner Hulk green / Datejust blue) — radial brushing.
// ---------------------------------------------------------------------------
// Per spec: sunray variation is ANGULAR, not radial — a mirrored pair of bright
// wedges (highlight tinted, never white for Hulk), dark sectors 90 degrees away,
// ~4:1 contrast, soft 10-20 degree wedge edges, hairline radial streaking.
function sunburst(id, pal, seed) {
  const rnd = mulberry32(seed);
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2 + 100;
  const rays = [];
  for (let i = 0; i < 2600; i++) {
    const a = rnd() * Math.PI * 2;
    const op = 0.006 + rnd() * 0.022;
    const col = rnd() > 0.45 ? '#ffffff' : '#000000';
    rays.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * R).toFixed(1)}" y2="${(cy + Math.sin(a) * R).toFixed(1)}" stroke="${col}" stroke-opacity="${op.toFixed(3)}" stroke-width="${(0.5 + rnd() * 0.7).toFixed(1)}"/>`);
  }
  const wedge = (a0, a1, col, op) => {
    const p = (a) => `${(cx + Math.cos(a) * R).toFixed(1)},${(cy + Math.sin(a) * R).toFixed(1)}`;
    const mid = (a0 + a1) / 2;
    return `<polygon points="${cx},${cy} ${p(a0)} ${p(mid)} ${p(a1)}" fill="${col}" fill-opacity="${op}" filter="url(#soft-${id})"/>`;
  };
  const d2r = (d) => (d * Math.PI) / 180;
  // bright pair mirrored through center on the vertical axis; dark pair horizontal
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
  <mask id="rm-${id}"><rect width="${W}" height="${H}" fill="url(#raymask-${id})"/></mask>`;
  const body = `
  <rect width="${W}" height="${H}" fill="url(#base-${id})"/>
  ${wedge(d2r(-128), d2r(-52), pal.hi, 0.28)}
  ${wedge(d2r(-108), d2r(-72), pal.hi, 0.22)}
  ${wedge(d2r(52), d2r(128), pal.hi, 0.24)}
  ${wedge(d2r(72), d2r(108), pal.hi, 0.18)}
  ${wedge(d2r(-20), d2r(20), pal.dark, 0.22)}
  ${wedge(d2r(160), d2r(200), pal.dark, 0.22)}
  <g mask="url(#rm-${id})">${rays.join('')}</g>`;
  return svgDoc(defs, body);
}

// Hulk: near-black forest green at rest, wedge flips to metallic emerald — never white.
const HULK = { base: '#143723', deep: '#0A2013', hi: '#3CA463', dark: '#02120A' };
// Azzurro: light, airy, desaturated; highlight goes silvery pale-blue, shadows grey out.
const DJ_BLUE = { base: '#587699', deep: '#455F7E', hi: '#C3D5E8', dark: '#2A3542' };

// ---------------------------------------------------------------------------
// 4. OP "Tiffany" turquoise lacquer — flat gloss color, gentle light.
// ---------------------------------------------------------------------------
function lacquer(id, pal) {
  const fin = sheenAndVignette(id, { sheenOpacity: 0.16, sheenCy: 0.30, vigOpacity: 0.22 });
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
  <rect width="${W}" height="${H}" fill="url(#lac-${id})"/>
  <rect width="${W}" height="${H}" filter="url(#grain-${id})"/>
  ${fin.body}`;
  return svgDoc(defs, body);
}
// Cooler and bluer than actual Tiffany blue (#0ABAB5 is too green/warm per spec).
const OP_TURQ = { top: '#4EBFCB', mid: '#33A9B7', bottom: '#2795A3' };

// ---------------------------------------------------------------------------
// 5. Grand Seiko Snowflake — soft snow-drift relief via turbulence lighting.
// ---------------------------------------------------------------------------
// Per spec: soft rounded drifts, shadows only ~12-18% darker and cool blue-grey,
// silvery-white base (not paint white), sparse pinpoint glints, no hard edges.
function snowflake(id) {
  const rnd = mulberry32(77);
  const glints = [];
  for (let i = 0; i < 160; i++) {
    glints.push(`<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.7 + rnd() * 1.0).toFixed(1)}" fill="#ffffff" fill-opacity="${(0.20 + rnd() * 0.35).toFixed(2)}"/>`);
  }
  const defs = `
  <filter id="snow-${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.009 0.011" numOctaves="5" seed="7" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#ffffff" surfaceScale="5.5" diffuseConstant="1.15" result="light">
      <feDistantLight azimuth="235" elevation="42"/>
    </feDiffuseLighting>
    <feComponentTransfer in="light" result="tone">
      <feFuncR type="table" tableValues="0.68 0.80 0.985"/>
      <feFuncG type="table" tableValues="0.71 0.82 0.985"/>
      <feFuncB type="table" tableValues="0.76 0.85 0.98"/>
    </feComponentTransfer>
  </filter>
  <filter id="micro-${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0"/>
  </filter>
  <radialGradient id="vig-${id}" cx="0.5" cy="0.5" r="0.78">
    <stop offset="0%" stop-color="#AFB8C0" stop-opacity="0"/>
    <stop offset="72%" stop-color="#AFB8C0" stop-opacity="0"/>
    <stop offset="100%" stop-color="#AFB8C0" stop-opacity="0.22"/>
  </radialGradient>`;
  const body = `
  <rect width="${W}" height="${H}" fill="#EAEDEE"/>
  <rect width="${W}" height="${H}" filter="url(#snow-${id})"/>
  <rect width="${W}" height="${H}" filter="url(#micro-${id})"/>
  <g>${glints.join('')}</g>
  <rect width="${W}" height="${H}" fill="url(#vig-${id})"/>`;
  return svgDoc(defs, body);
}

// ---------------------------------------------------------------------------
// 6. Speedmaster — matte black with fine grain and the famous "step".
// ---------------------------------------------------------------------------
// Per spec: matte charcoal (never pure black, never a hotspot), whole plane shifts
// tone together; the step is a subtle hairline arc at ~80% radius, not a trench.
function speedmaster(id) {
  const cx = W / 2, cy = H / 2, stepR = 990;
  const defs = `
  <filter id="grain-${id}">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="21" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.97  0 0 0 0.05 0"/>
  </filter>`;
  const body = `
  <rect width="${W}" height="${H}" fill="#1B1B1A"/>
  <path d="M0 0 H${W} V${H} H0 Z M${cx + stepR} ${cy} A${stepR} ${stepR} 0 1 0 ${cx - stepR} ${cy} A${stepR} ${stepR} 0 1 0 ${cx + stepR} ${cy} Z" fill="#000000" fill-opacity="0.12" fill-rule="evenodd"/>
  <circle cx="${cx}" cy="${cy}" r="${stepR}" fill="none" stroke="#0A0A0A" stroke-opacity="0.75" stroke-width="7"/>
  <circle cx="${cx}" cy="${cy}" r="${stepR + 6}" fill="none" stroke="#3A3A37" stroke-opacity="0.7" stroke-width="2.5"/>
  <rect width="${W}" height="${H}" filter="url(#grain-${id})"/>`;
  return svgDoc(defs, body);
}

// ---------------------------------------------------------------------------
// 7. Cartier-style silver flinqué guilloché — radiating wavy rings.
// ---------------------------------------------------------------------------
function guilloche(id) {
  const cx = W / 2, cy = H / 2;
  const rings = [];
  const maxR = Math.hypot(W, H) / 2 + 60;
  let k = 0;
  for (let r0 = 14; r0 < maxR; r0 += 13, k++) {
    const amp = 3.2 + r0 * 0.0012;
    const waves = 18;
    const phase = r0 * 0.022;
    const pts = [];
    const steps = 360;
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r = r0 + amp * Math.sin(waves * th + phase);
      pts.push(`${(cx + r * Math.cos(th)).toFixed(1)},${(cy + r * Math.sin(th)).toFixed(1)}`);
    }
    const col = k % 2 === 0 ? '#B7B7AF' : '#F4F4EF';
    rings.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="1.8" stroke-opacity="0.9"/>`);
  }
  const fin = sheenAndVignette(id, { sheenOpacity: 0.20, sheenCy: 0.32, vigOpacity: 0.16 });
  const defs = fin.defs;
  const body = `
  <rect width="${W}" height="${H}" fill="#DDDDD6"/>
  <g>${rings.join('\n')}</g>
  ${fin.body}`;
  return svgDoc(defs, body);
}

// ---------------------------------------------------------------------------
const designs = {
  'tapisserie-blue': tapisserie('tb', TAP_BLUE),
  'tapisserie-green': tapisserie('tg', TAP_GREEN),
  'tapisserie-black': tapisserie('tk', TAP_BLACK),
  'nautilus-blue': nautilus('nb'),
  'sunburst-hulk': sunburst('sh', HULK, 101),
  'sunburst-datejust': sunburst('sd', DJ_BLUE, 202),
  'op-turquoise': lacquer('ot', OP_TURQ),
  'snowflake': snowflake('sf'),
  'speedmaster-black': speedmaster('sp'),
  'guilloche-silver': guilloche('gs'),
};

for (const [name, svg] of Object.entries(designs)) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
  console.log(`${name}.svg  ${(svg.length / 1024).toFixed(0)} KB`);
}

// Preview grid for visual inspection.
const names = Object.keys(designs);
const tiles = names.map((n) => `
  <figure><img src="out/${n}.svg" alt="${n}"/><figcaption>${n}</figcaption></figure>`).join('');
fs.writeFileSync(path.join(__dirname, 'preview.html'), `<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #202024; display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 10px; }
  figure { margin: 0; }
  img { width: 100%; aspect-ratio: ${W}/${H}; display: block; border-radius: 10px; }
  figcaption { color: #aaa; font: 12px -apple-system, sans-serif; text-align: center; padding: 4px; }
</style>
${tiles}`);
console.log('preview.html written');
