export type Dial = {
  slug: string;
  file: string;
  name: string;
  pairs: string;
  family: string;
  /** dials light enough that the lock-screen clock needs dark ink */
  lightDial?: boolean;
};

export const DIALS: Dial[] = [
  { slug: 'octagon-bleu', file: 'tapisserie-blue', name: 'Octagon Bleu', pairs: 'Royal Oak, blue Grande Tapisserie', family: 'Waffle guilloché' },
  { slug: 'octagon-vert', file: 'tapisserie-green', name: 'Octagon Vert', pairs: 'Royal Oak 15510, green', family: 'Waffle guilloché' },
  { slug: 'octagon-noir', file: 'tapisserie-black', name: 'Octagon Noir', pairs: 'Royal Oak, black', family: 'Waffle guilloché' },
  { slug: 'porthole-blue', file: 'nautilus-blue', name: 'Porthole Blue', pairs: 'Nautilus 5711, blue gradient', family: 'Embossed bars' },
  { slug: 'emerald-sunray', file: 'sunburst-hulk', name: 'Emerald Sunray', pairs: 'Submariner 116610LV “Hulk”', family: 'Sunray brushing' },
  { slug: 'azzurro-sunray', file: 'sunburst-datejust', name: 'Azzurro Sunray', pairs: 'Datejust, azzurro blue', family: 'Sunray brushing' },
  { slug: 'turquoise-lacquer', file: 'op-turquoise', name: 'Turquoise Lacquer', pairs: 'Oyster Perpetual 124300', family: 'Flat lacquer', lightDial: true },
  { slug: 'first-snow', file: 'snowflake', name: 'First Snow', pairs: 'Grand Seiko SBGA211 “Snowflake”', family: 'Silvered relief', lightDial: true },
  { slug: 'moondust', file: 'speedmaster-black', name: 'Moondust', pairs: 'Speedmaster Professional, step dial', family: 'Matte grain' },
  { slug: 'flinque-argent', file: 'guilloche-silver', name: 'Flinqué Argent', pairs: 'Cartier-style engine turning', family: 'Guilloché', lightDial: true },
];

/** Master artboard the SVGs are drawn on. */
export const ART_W = 1320;
export const ART_H = 2868;

export const SIZES: Array<[number, number]> = [
  [1179, 2556],
  [1320, 2868],
  [1440, 3200],
];
