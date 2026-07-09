// Renders every built-in dial through @resvg/resvg-js (as the API route will)
// and samples pixels to compare against browser-rendered references.
import { Resvg } from '@resvg/resvg-js';
import { renderBuiltin } from '../lib/generator';
import { DIALS } from '../lib/dials';

// center / 25%,25% / 75%,75% RGB references measured in Chrome at 1179x2556
const REF: Record<string, number[][]> = {
  'octagon-bleu': [[58, 82, 108], [44, 65, 87], [42, 68, 97]],
  'octagon-vert': [[56, 97, 76], [43, 77, 59], [38, 84, 61]],
  'octagon-noir': [[61, 61, 68], [49, 49, 53], [45, 45, 52]],
  'porthole-blue': [[49, 84, 117], [38, 63, 85], [24, 43, 57]],
  'emerald-sunray': [[24, 67, 43], [30, 81, 49], [30, 75, 47]],
  'azzurro-sunray': [[98, 126, 155], [114, 139, 169], [110, 134, 165]],
  'turquoise-lacquer': [[77, 180, 192], [85, 188, 200], [56, 164, 177]],
  'first-snow': [[238, 239, 241], [239, 241, 243], [241, 242, 244]],
  'moondust': [[35, 35, 33], [33, 33, 32], [32, 32, 31]],
  'flinque-argent': [[225, 225, 219], [225, 225, 219], [223, 223, 216]],
};

const W = 1179, H = 2556;
let worst = 0;
let failures = 0;

for (const d of DIALS) {
  const svg = renderBuiltin(d.slug, { width: W, height: H })!;
  const t0 = Date.now();
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render();
  const ms = Date.now() - t0;
  const { pixels, width } = { pixels: png.pixels, width: png.width };
  const px = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return [pixels[i], pixels[i + 1], pixels[i + 2]];
  };
  const samples = [px(W >> 1, H >> 1), px(W >> 2, H >> 2), px((W * 3) >> 2, (H * 3) >> 2)];
  const refs = REF[d.slug];
  const deltas = samples.map((s, i) => Math.max(...s.map((c, j) => Math.abs(c - refs[i][j]))));
  const maxDelta = Math.max(...deltas);
  worst = Math.max(worst, maxDelta);
  const ok = maxDelta <= 30;
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${d.slug.padEnd(18)} maxΔ=${String(maxDelta).padStart(3)} ${ms}ms  ` +
    samples.map((s) => s.join(',')).join('  '),
  );
}
console.log(`\nworst channel delta: ${worst}  failures: ${failures}`);
process.exit(failures ? 1 : 0);
