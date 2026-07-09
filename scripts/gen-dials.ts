// Regenerates public/dials/*.svg from lib/generator.ts (the single source of
// truth). Run: npx tsx scripts/gen-dials.ts
import fs from 'node:fs';
import path from 'node:path';
import { renderBuiltin } from '../lib/generator';
import { DIALS } from '../lib/dials';

const out = path.join(process.cwd(), 'public', 'dials');
fs.mkdirSync(out, { recursive: true });

for (const d of DIALS) {
  const svg = renderBuiltin(d.slug);
  if (!svg) throw new Error(`no builtin renderer for ${d.slug}`);
  fs.writeFileSync(path.join(out, `${d.file}.svg`), svg);
  console.log(`${d.file}.svg  ${(svg.length / 1024).toFixed(0)} KB`);
}
