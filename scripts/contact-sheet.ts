// Renders every catalog variant as a tile into contact.html for visual review
// of the researched palettes. Screenshot it with headless Chrome.
import fs from 'node:fs';
import path from 'node:path';
import { CATALOG } from '../lib/catalog';
import { renderFamily } from '../lib/generator';

const tiles: string[] = [];
let count = 0;
for (const b of CATALOG) {
  for (const m of b.models) {
    for (const t of m.types) {
      for (const v of t.variants) {
        count++;
        const svg = renderFamily(v.family, v.colors);
        const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        const typePart = t.label.toLowerCase() === 'standard' ? '' : ` · ${t.label}`;
        tiles.push(`
<figure><img src="${uri}" loading="lazy"/><figcaption><b>${b.label} ${m.label}</b>${typePart}<br>${v.label} · ${v.family} · ${v.colors.join(' ')}</figcaption></figure>`);
      }
    }
  }
}

fs.writeFileSync(
  path.join(import.meta.dirname, '..', 'contact.html'),
  `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#202024;display:grid;grid-template-columns:repeat(8,1fr);gap:8px;padding:8px}
  figure{margin:0}img{width:100%;aspect-ratio:1320/2868;border-radius:6px;display:block}
  figcaption{color:#bbb;font:9px -apple-system,sans-serif;padding:2px;line-height:1.35}
  </style>${tiles.join('')}`,
);
console.log(`contact.html written — ${count} variants`);
