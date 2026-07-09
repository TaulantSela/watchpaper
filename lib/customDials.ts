import { FAMILIES, type FamilyKey } from './generator';

export type CustomDial = {
  id: string;
  name: string;
  family: FamilyKey;
  /** 1-3 anchor hex colours extracted from the user's photo */
  colors: string[];
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
  return parsed.filter(
    (d): d is CustomDial =>
      !!d &&
      typeof d === 'object' &&
      typeof (d as CustomDial).id === 'string' &&
      typeof (d as CustomDial).name === 'string' &&
      FAMILIES.some((f) => f.key === (d as CustomDial).family) &&
      Array.isArray((d as CustomDial).colors) &&
      (d as CustomDial).colors.length > 0 &&
      (d as CustomDial).colors.every(isHex),
  );
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
