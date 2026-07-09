import type { NextRequest } from 'next/server';
import { Resvg } from '@resvg/resvg-js';
import { FAMILIES, renderBuiltin, renderFamily, type FamilyKey } from '@/lib/generator';

// PNG wallpapers for the iOS Shortcuts flow ("Get Contents of URL" needs a
// real image URL). Output is fully determined by the query, so cache forever.
//
//   /api/wallpaper?dial=octagon-bleu&w=1179&h=2556
//   /api/wallpaper?family=sunray&colors=143723,3ca463&w=1179&h=2556

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const w = clamp(parseInt(sp.get('w') ?? '1179', 10) || 1179, 320, 2200);
  const h = clamp(parseInt(sp.get('h') ?? '2556', 10) || 2556, 320, 4400);

  const dial = sp.get('dial');
  let svg: string | null = null;
  let name = dial ?? 'wallpaper';

  if (dial) {
    svg = renderBuiltin(dial, { width: w, height: h });
  } else {
    const family = sp.get('family') as FamilyKey | null;
    const colors = (sp.get('colors') ?? '')
      .split(',')
      .filter((c) => /^[0-9a-fA-F]{6}$/.test(c))
      .map((c) => `#${c.toLowerCase()}`);
    if (family && FAMILIES.some((f) => f.key === family) && colors.length > 0) {
      svg = renderFamily(family, colors, { width: w, height: h });
      name = `custom-${family}`;
    }
  }

  if (!svg) {
    return new Response('Unknown wallpaper. Pass ?dial=<slug> or ?family=<key>&colors=<hex,...>.', {
      status: 400,
    });
  }

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${name}-${w}x${h}.png"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
