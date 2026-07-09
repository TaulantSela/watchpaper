// Builds gallery.html — self-contained WatchPaper gallery with inline SVGs
// and client-side PNG export. Run after gen.js.
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');

const DESIGNS = [
  { slug: 'octagon-bleu', file: 'tapisserie-blue', name: 'Octagon Bleu', pairs: 'Royal Oak, blue Grande Tapisserie', family: 'Waffle guilloché' },
  { slug: 'octagon-vert', file: 'tapisserie-green', name: 'Octagon Vert', pairs: 'Royal Oak 15510, green', family: 'Waffle guilloché' },
  { slug: 'octagon-noir', file: 'tapisserie-black', name: 'Octagon Noir', pairs: 'Royal Oak, black', family: 'Waffle guilloché' },
  { slug: 'porthole-blue', file: 'nautilus-blue', name: 'Porthole Blue', pairs: 'Nautilus 5711, blue gradient', family: 'Embossed bars' },
  { slug: 'emerald-sunray', file: 'sunburst-hulk', name: 'Emerald Sunray', pairs: 'Submariner 116610LV “Hulk”', family: 'Sunray brushing' },
  { slug: 'azzurro-sunray', file: 'sunburst-datejust', name: 'Azzurro Sunray', pairs: 'Datejust, azzurro blue', family: 'Sunray brushing' },
  { slug: 'turquoise-lacquer', file: 'op-turquoise', name: 'Turquoise Lacquer', pairs: 'Oyster Perpetual 124300', family: 'Flat lacquer' },
  { slug: 'first-snow', file: 'snowflake', name: 'First Snow', pairs: 'Grand Seiko SBGA211 “Snowflake”', family: 'Silvered relief' },
  { slug: 'moondust', file: 'speedmaster-black', name: 'Moondust', pairs: 'Speedmaster Professional, step dial', family: 'Matte grain' },
  { slug: 'flinque-argent', file: 'guilloche-silver', name: 'Flinqué Argent', pairs: 'Cartier-style engine turning', family: 'Guilloché' },
];

const cards = DESIGNS.map((d, i) => {
  const svg = fs.readFileSync(path.join(OUT, `${d.file}.svg`), 'utf8');
  return `
<figure class="card" data-idx="${i}">
  <button class="frame" id="art-${d.slug}" aria-label="Preview ${d.name} full screen">${svg}</button>
  <figcaption>
    <h2 class="name">${d.name}</h2>
    <p class="pairs"><span class="fam">${d.family}</span> · pairs with the ${d.pairs}</p>
    <div class="dl" role="group" aria-label="Download ${d.name}">
      <button data-slug="${d.slug}" data-w="1179" data-h="2556">1179 × 2556</button>
      <button data-slug="${d.slug}" data-w="1320" data-h="2868">1320 × 2868</button>
      <button data-slug="${d.slug}" data-w="1440" data-h="3200">1440 × 3200</button>
    </div>
  </figcaption>
</figure>`;
}).join('\n');

const meta = JSON.stringify(DESIGNS.map(d => ({ slug: d.slug, name: d.name, pairs: d.pairs })));

const html = `<title>WatchPaper — Famous Dials, Vol. 1</title>
<style>
:root {
  --bg: #14161A; --panel: #1B1E24; --ink: #E9E6DE; --muted: #9A9DA6;
  --accent: #C6A15B; --line: #2A2E36; --frame: #343943;
  --display: "Didot", "Bodoni 72", "Playfair Display", Georgia, serif;
  --body: "Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif;
  --mono: "SF Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: light) {
  :root { --bg: #F0EFEB; --panel: #FFFFFF; --ink: #16181D; --muted: #676B74; --accent: #9A7836; --line: #DDDBD3; --frame: #C6C4BC; }
}
:root[data-theme="dark"] { --bg: #14161A; --panel: #1B1E24; --ink: #E9E6DE; --muted: #9A9DA6; --accent: #C6A15B; --line: #2A2E36; --frame: #343943; }
:root[data-theme="light"] { --bg: #F0EFEB; --panel: #FFFFFF; --ink: #16181D; --muted: #676B74; --accent: #9A7836; --line: #DDDBD3; --frame: #C6C4BC; }

body { background: var(--bg); color: var(--ink); font-family: var(--body); margin: 0; }
.wrap { max-width: 1180px; margin: 0 auto; padding: 56px 28px 80px; }

header { border-bottom: 1px solid var(--line); padding-bottom: 36px; margin-bottom: 44px; }
.eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px; }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(34px, 5.4vw, 58px); line-height: 1.05; margin: 0 0 16px; text-wrap: balance; }
h1 em { font-style: italic; }
.standfirst { color: var(--muted); font-size: 16px; line-height: 1.6; max-width: 56ch; margin: 0; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 34px 26px; }
.card { margin: 0; }
.frame { display: block; width: 100%; aspect-ratio: 1320 / 2868; padding: 0; overflow: hidden;
  border: 1px solid var(--frame); border-radius: 26px; background: var(--panel); cursor: zoom-in;
  box-shadow: 0 18px 40px -22px rgba(0,0,0,0.55); }
.frame svg { width: 100%; height: 100%; display: block; }
.frame:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
figcaption { padding: 14px 2px 0; }
.name { font-family: var(--display); font-weight: 400; font-size: 21px; margin: 0 0 4px; }
.pairs { color: var(--muted); font-size: 12.5px; line-height: 1.5; margin: 0 0 10px; }
.fam { color: var(--accent); letter-spacing: 0.06em; text-transform: uppercase; font-size: 10.5px; }

.dl { display: flex; flex-wrap: wrap; gap: 6px; }
.dl button, .lb-dl button { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 11px;
  color: var(--muted); background: none; border: 1px solid var(--line); border-radius: 999px;
  padding: 5px 10px; cursor: pointer; transition: color .15s, border-color .15s; }
.dl button:hover, .lb-dl button:hover { color: var(--accent); border-color: var(--accent); }
.dl button:focus-visible, .lb-dl button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.dl button.done, .lb-dl button.done { color: var(--accent); border-color: var(--accent); }

footer { margin-top: 64px; border-top: 1px solid var(--line); padding-top: 24px; color: var(--muted); font-size: 12.5px; line-height: 1.7; max-width: 78ch; }
footer strong { color: var(--ink); font-weight: 600; }

/* Lightbox */
.lb { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; flex-direction: column;
  gap: 16px; background: rgba(8,9,11,0.82); backdrop-filter: blur(14px); z-index: 10; padding: 24px; }
.lb.open { display: flex; }
.lb-phone { position: relative; height: min(78vh, 900px); aspect-ratio: 1320 / 2868;
  border-radius: 34px; overflow: hidden; border: 1px solid rgba(255,255,255,0.22);
  box-shadow: 0 40px 90px -30px rgba(0,0,0,0.9); }
.lb-phone svg { width: 100%; height: 100%; display: block; }
.lb-clock { position: absolute; top: 7%; left: 0; right: 0; text-align: center; color: rgba(255,255,255,0.94);
  text-shadow: 0 1px 12px rgba(0,0,0,0.25); pointer-events: none; }
.lb-clock .date { font-size: clamp(11px, 1.6vh, 15px); font-weight: 500; letter-spacing: 0.02em; margin-bottom: 2px; }
.lb-clock .time { font-size: clamp(48px, 9.5vh, 84px); font-weight: 200; letter-spacing: 0.01em; line-height: 1; }
.lb-clock.dark-ink { color: rgba(20,22,26,0.88); text-shadow: 0 1px 10px rgba(255,255,255,0.18); }
.lb-meta { text-align: center; color: #E9E6DE; }
.lb-meta .name { font-size: 24px; }
.lb-meta .pairs { color: rgba(233,230,222,0.65); margin-bottom: 12px; }
.lb-dl { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.lb-dl button { color: rgba(233,230,222,0.75); border-color: rgba(233,230,222,0.28); }
.lb-ctl { position: absolute; top: 20px; right: 24px; display: flex; gap: 10px; }
.lb-ctl button, .lb-nav button { background: rgba(255,255,255,0.10); color: #fff; border: none; border-radius: 999px;
  font-family: var(--body); font-size: 13px; padding: 8px 14px; cursor: pointer; }
.lb-ctl button:hover, .lb-nav button:hover { background: rgba(255,255,255,0.22); }
.lb-ctl button:focus-visible, .lb-nav button:focus-visible { outline: 2px solid #C6A15B; outline-offset: 2px; }
.lb-nav { position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between; padding: 0 18px; box-sizing: border-box; }
@media (prefers-reduced-motion: no-preference) {
  .lb.open .lb-phone { animation: rise .28s ease-out; }
  @keyframes rise { from { transform: translateY(10px); opacity: 0; } to { transform: none; opacity: 1; } }
}
</style>

<div class="wrap">
<header>
  <p class="eyebrow">WatchPaper · Study Nº 1</p>
  <h1>The dial, <em>and nothing else.</em></h1>
  <p class="standfirst">Ten famous watch dials reduced to pure texture and colour — drawn as vector art, scaled about eight-fold for macro effect, and sized for your lock screen. No logos, no indices, no hands. Tap a dial to try it under a lock-screen clock; download at your phone's exact resolution.</p>
</header>

<div class="grid">
${cards}
</div>

<footer>
  <p><strong>On the naming.</strong> Every wallpaper here is an original artwork inspired by a dial <em>finish</em> — waffle guilloché, embossed bars, sunray brushing, lacquer, silvered snow relief, matte grain. Watch model names appear solely to identify which watch a wallpaper pairs with; this study is not affiliated with, or endorsed by, any watchmaker.</p>
</footer>
</div>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Wallpaper preview">
  <div class="lb-ctl">
    <button id="lb-clock-toggle" aria-pressed="true">Clock on</button>
    <button id="lb-close" aria-label="Close preview">Close ✕</button>
  </div>
  <div class="lb-phone" id="lb-phone"></div>
  <div class="lb-meta">
    <div class="name" id="lb-name"></div>
    <div class="pairs" id="lb-pairs"></div>
    <div class="lb-dl" id="lb-dl"></div>
  </div>
  <div class="lb-nav">
    <button id="lb-prev" aria-label="Previous wallpaper">←</button>
    <button id="lb-next" aria-label="Next wallpaper">→</button>
  </div>
</div>

<script>
var DESIGNS = ${meta};
var LIGHT_INK = { 'first-snow': true, 'flinque-argent': true, 'turquoise-lacquer': true };
var SIZES = [[1179,2556],[1320,2868],[1440,3200]];

function svgFor(slug) { return document.querySelector('#art-' + slug + ' svg'); }

function exportPNG(slug, tw, th, btn) {
  var xml = new XMLSerializer().serializeToString(svgFor(slug));
  var url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  var img = new Image();
  img.onload = function () {
    var c = document.createElement('canvas'); c.width = tw; c.height = th;
    var ctx = c.getContext('2d');
    var s = Math.max(tw / 1320, th / 2868);
    ctx.drawImage(img, (tw - 1320 * s) / 2, (th - 2868 * s) / 2, 1320 * s, 2868 * s);
    URL.revokeObjectURL(url);
    c.toBlob(function (b) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = slug + '-' + tw + 'x' + th + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      if (btn) { var t = btn.textContent; btn.classList.add('done'); btn.textContent = 'Saved ✓';
        setTimeout(function () { btn.classList.remove('done'); btn.textContent = t; }, 1800); }
    }, 'image/png');
  };
  img.src = url;
}

document.querySelectorAll('.dl button').forEach(function (b) {
  b.addEventListener('click', function () { exportPNG(b.dataset.slug, +b.dataset.w, +b.dataset.h, b); });
});

var lb = document.getElementById('lb'), cur = 0, clockOn = true;

function fmtDate() {
  var d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function openLb(i) {
  cur = (i + DESIGNS.length) % DESIGNS.length;
  var d = DESIGNS[cur];
  var phone = document.getElementById('lb-phone');
  phone.innerHTML = '';
  phone.appendChild(svgFor(d.slug).cloneNode(true));
  if (clockOn) {
    var ov = document.createElement('div');
    ov.className = 'lb-clock' + (LIGHT_INK[d.slug] ? ' dark-ink' : '');
    ov.innerHTML = '<div class="date">' + fmtDate() + '</div><div class="time">10:09</div>';
    phone.appendChild(ov);
  }
  document.getElementById('lb-name').textContent = d.name;
  document.getElementById('lb-pairs').textContent = 'pairs with the ' + d.pairs;
  var dl = document.getElementById('lb-dl');
  dl.innerHTML = '';
  SIZES.forEach(function (s) {
    var b = document.createElement('button');
    b.textContent = s[0] + ' × ' + s[1];
    b.addEventListener('click', function () { exportPNG(d.slug, s[0], s[1], b); });
    dl.appendChild(b);
  });
  lb.classList.add('open');
  document.getElementById('lb-close').focus();
}

document.querySelectorAll('.card .frame').forEach(function (f, i) {
  f.addEventListener('click', function () { openLb(i); });
});
document.getElementById('lb-close').addEventListener('click', function () { lb.classList.remove('open'); });
document.getElementById('lb-prev').addEventListener('click', function () { openLb(cur - 1); });
document.getElementById('lb-next').addEventListener('click', function () { openLb(cur + 1); });
document.getElementById('lb-clock-toggle').addEventListener('click', function () {
  clockOn = !clockOn;
  this.textContent = clockOn ? 'Clock on' : 'Clock off';
  this.setAttribute('aria-pressed', String(clockOn));
  openLb(cur);
});
document.addEventListener('keydown', function (e) {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') lb.classList.remove('open');
  if (e.key === 'ArrowLeft') openLb(cur - 1);
  if (e.key === 'ArrowRight') openLb(cur + 1);
});
</script>`;

fs.writeFileSync(path.join(__dirname, 'gallery.html'), html);
console.log(`gallery.html written  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
