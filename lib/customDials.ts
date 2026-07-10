import { FAMILIES, type FamilyKey } from './generator';

export type CustomDial = {
  id: string;
  name: string;
  /** 'params' = re-drawn in a finish family; 'photo' = composed from the photo (master in IndexedDB) */
  kind: 'params' | 'photo';
  /** params kind only: finish family */
  family?: FamilyKey;
  /** params kind only: 1-3 anchor hex colours extracted from the photo */
  colors?: string[];
  /** photo kind only: does the lock-screen clock need dark ink over it */
  light?: boolean;
  /** which watch this pairs with, e.g. "Tissot PRX Powermatic 80, green waffle" */
  pairs?: string;
};

const KEY = 'watchpaper.custom';

const isHex = (c: unknown): c is string => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);

export function loadCustomDials(): CustomDial[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  const dials: CustomDial[] = [];
  for (const raw of parsed) {
    if (!raw || typeof raw !== 'object') continue;
    const d = raw as Record<string, unknown>;
    if (typeof d.id !== 'string' || typeof d.name !== 'string') continue;
    // entries saved before the photo feature have no `kind` — they are params
    const kind = d.kind === 'photo' ? 'photo' : 'params';
    const pairs = typeof d.pairs === 'string' ? d.pairs : undefined;
    if (kind === 'photo') {
      dials.push({ id: d.id, name: d.name, kind, light: d.light === true, pairs });
    } else if (
      FAMILIES.some((f) => f.key === d.family) &&
      Array.isArray(d.colors) &&
      d.colors.length > 0 &&
      d.colors.every(isHex)
    ) {
      dials.push({
        id: d.id,
        name: d.name,
        kind,
        family: d.family as FamilyKey,
        colors: d.colors as string[],
        pairs,
      });
    }
  }
  return dials;
}

export function saveCustomDials(dials: CustomDial[]) {
  localStorage.setItem(KEY, JSON.stringify(dials));
}

export function addCustomDial(dial: Omit<CustomDial, 'id'>): CustomDial {
  const withId: CustomDial = { ...dial, id: `custom-${Date.now().toString(36)}` };
  saveCustomDials([...loadCustomDials(), withId]);
  return withId;
}

export function removeCustomDial(id: string) {
  saveCustomDials(loadCustomDials().filter((d) => d.id !== id));
}
