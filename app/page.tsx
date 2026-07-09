'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ART_H, ART_W, DIALS, SIZES } from '@/lib/dials';
import { loadCustomDials, removeCustomDial, type CustomDial } from '@/lib/customDials';
import { FAMILIES, luminance, renderFamily } from '@/lib/generator';

const COLLECTION_KEY = 'watchpaper.collection';
const CURRENT_KEY = 'watchpaper.current';

/** unified view over built-in and photo-derived dials */
type UiDial = {
  slug: string;
  name: string;
  sub: string;
  famLabel: string;
  lightDial: boolean;
  file?: string; // built-in: static SVG under /dials
  custom?: CustomDial;
};

function toUiDials(customs: CustomDial[]): UiDial[] {
  const builtins: UiDial[] = DIALS.map((d) => ({
    slug: d.slug,
    name: d.name,
    sub: `pairs with the ${d.pairs}`,
    famLabel: d.family,
    lightDial: !!d.lightDial,
    file: d.file,
  }));
  const customUi: UiDial[] = customs.map((c) => ({
    slug: c.id,
    name: c.name,
    sub: 'from your photo',
    famLabel: FAMILIES.find((f) => f.key === c.family)?.label ?? c.family,
    lightDial: luminance(c.colors[0]) > 0.6,
    custom: c,
  }));
  return [...builtins, ...customUi];
}

function readOwnedBuiltins(): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '[]');
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((s): s is string => typeof s === 'string' && DIALS.some((d) => d.slug === s));
}

async function svgSource(dial: UiDial): Promise<string> {
  if (dial.custom) return renderFamily(dial.custom.family, dial.custom.colors);
  return fetch(`/dials/${dial.file}.svg`).then((r) => r.text());
}

async function renderPng(dial: UiDial, w: number, h: number): Promise<Blob> {
  const xml = await svgSource(dial);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Could not render the wallpaper.'));
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const s = Math.max(w / ART_W, h / ART_H);
    ctx.drawImage(img, (w - ART_W * s) / 2, (h - ART_H * s) / 2, ART_W * s, ART_H * s);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed.'))), 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadFile(file: File) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/** wallpaper URL for the Shortcuts flow — must be absolute and self-describing */
function wallpaperUrl(dial: UiDial, w: number, h: number): string {
  const base = typeof location !== 'undefined' ? location.origin : '';
  if (dial.custom) {
    const colors = dial.custom.colors.map((c) => c.replace('#', '')).join(',');
    return `${base}/api/wallpaper?family=${dial.custom.family}&colors=${colors}&w=${w}&h=${h}`;
  }
  return `${base}/api/wallpaper?dial=${dial.slug}&w=${w}&h=${h}`;
}

/** custom dials render client-side; cache SVG object URLs per dial id */
function CustomDialImg({ dial, alt }: { dial: CustomDial; alt: string }) {
  const svg = useMemo(() => renderFamily(dial.family, dial.colors), [dial]);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [svg]);
  return url ? <img src={url} alt={alt} /> : null;
}

function DialImg({ dial, alt }: { dial: UiDial; alt: string }) {
  if (dial.custom) return <CustomDialImg dial={dial.custom} alt={alt} />;
  return <img src={`/dials/${dial.file}.svg`} alt={alt} />;
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useDeviceSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([1179, 2556]);
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(Math.min(screen.width, screen.height) * dpr);
    const h = Math.round(Math.max(screen.width, screen.height) * dpr);
    if (w > 400 && h > 800) setSize([w, h]);
  }, []);
  return size;
}

type ReadyFile = { file: File; w: number; h: number };

export default function Home() {
  const [ownedBuiltins, setOwnedBuiltins] = useState<string[] | null>(null);
  const [customs, setCustoms] = useState<CustomDial[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState<ReadyFile | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const noteTimer = useRef<number | null>(null);
  const now = useClock();
  const [devW, devH] = useDeviceSize();

  const note = useCallback((msg: string | null, ttl = 6000) => {
    if (noteTimer.current) clearTimeout(noteTimer.current);
    setSavedNote(msg);
    if (msg) noteTimer.current = window.setTimeout(() => setSavedNote(null), ttl);
  }, []);

  useEffect(() => {
    const owned = readOwnedBuiltins();
    const cust = loadCustomDials();
    setOwnedBuiltins(owned);
    setCustoms(cust);
    setEditing(owned.length === 0 && cust.length === 0);
    const wearable = [...owned, ...cust.map((c) => c.id)];
    const last = localStorage.getItem(CURRENT_KEY);
    setCurrent(wearable.includes(last ?? '') ? last : wearable[0] ?? null);
  }, []);

  useEffect(() => {
    if (ownedBuiltins !== null) localStorage.setItem(COLLECTION_KEY, JSON.stringify(ownedBuiltins));
  }, [ownedBuiltins]);

  useEffect(() => {
    if (current) localStorage.setItem(CURRENT_KEY, current);
  }, [current]);

  useEffect(() => {
    setReady(null);
  }, [current]);

  const allDials = useMemo(() => toUiDials(customs), [customs]);
  const wearable = useMemo(
    () =>
      allDials.filter((d) => d.custom || ownedBuiltins?.includes(d.slug)),
    [allDials, ownedBuiltins],
  );
  const dial = allDials.find((d) => d.slug === current);

  const toggleOwned = useCallback((slug: string) => {
    setOwnedBuiltins((prev) => {
      const list = prev ?? [];
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      setCurrent((c) => {
        const stillWearable = [...next, ...customs.map((x) => x.id)];
        return stillWearable.includes(c ?? '') ? c : stillWearable[0] ?? null;
      });
      return next;
    });
  }, [customs]);

  const removeCustom = useCallback((id: string) => {
    removeCustomDial(id);
    setCustoms((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setCurrent((c) => {
        if (c !== id) return c;
        const stillWearable = [...(ownedBuiltins ?? []), ...next.map((x) => x.id)];
        return stillWearable[0] ?? null;
      });
      return next;
    });
  }, [ownedBuiltins]);

  const prepare = useCallback(
    async (w: number, h: number) => {
      if (!dial || saving) return;
      setSaving(true);
      setReady(null);
      note(null);
      try {
        const blob = await renderPng(dial, w, h);
        const file = new File([blob], `${dial.slug}-${w}x${h}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          setReady({ file, w, h });
          note('Rendered. Tap “Open share sheet”, then choose “Save Image”.', 30000);
        } else {
          downloadFile(file);
          note(`Saved ${dial.name} at ${w} × ${h}.`);
        }
      } catch (err) {
        note((err as Error).message);
      } finally {
        setSaving(false);
      }
    },
    [dial, saving, note],
  );

  const shareReady = useCallback(async () => {
    if (!ready) return;
    try {
      await navigator.share({ files: [ready.file] });
      note('Sent to the share sheet — choose “Save Image” to add it to Photos.');
      setReady(null);
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
      downloadFile(ready.file);
      note('Sharing was blocked — downloaded the file instead.');
      setReady(null);
    }
  }, [ready, note]);

  const primaryLabel = saving
    ? 'Rendering…'
    : ready
      ? 'Open share sheet'
      : `Save wallpaper · ${devW} × ${devH}`;

  const primaryAction = () => {
    if (saving) return;
    if (ready) void shareReady();
    else void prepare(devW, devH);
  };

  const setViaShortcut = () => {
    if (!dial) return;
    const url = wallpaperUrl(dial, devW, devH);
    location.href = `shortcuts://run-shortcut?name=${encodeURIComponent('WatchPaper')}&input=text&text=${encodeURIComponent(url)}`;
  };

  const copyWallpaperUrl = async () => {
    if (!dial) return;
    const url = wallpaperUrl(dial, devW, devH);
    try {
      await navigator.clipboard.writeText(url);
      note('Wallpaper URL copied.');
    } catch {
      note(url, 20000); // clipboard blocked — show the URL so it can be copied by hand
    }
  };

  const loaded = ownedBuiltins !== null;

  return (
    <main className="wrap">
      <p className="eyebrow">WatchPaper</p>
      <h1>
        On the wrist <em>today?</em>
      </h1>
      <p className="sub">
        Pick the watch you&rsquo;re wearing and your lock screen matches it — the dial as pure
        texture and colour. No logos, no indices, no hands.
      </p>

      {loaded && (
        <>
          <div className="chips-head">
            <span className="chips-label">My watches</span>
            <button className="edit-btn" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done' : 'Edit collection'}
            </button>
          </div>

          {editing ? (
            <>
              <div className="editor" role="group" aria-label="Choose the watches you own">
                {DIALS.map((d) => {
                  const isOwned = ownedBuiltins.includes(d.slug);
                  return (
                    <button
                      key={d.slug}
                      className={`pick${isOwned ? ' owned' : ''}`}
                      onClick={() => toggleOwned(d.slug)}
                      aria-pressed={isOwned}
                    >
                      <span className="mini">
                        <img src={`/dials/${d.file}.svg`} alt="" loading="lazy" />
                        {isOwned && <span className="tick">✓</span>}
                      </span>
                      <span className="mini-name">{d.name}</span>
                    </button>
                  );
                })}
                <Link href="/studio" className="pick studio-tile">
                  <span className="mini">
                    <span className="studio-plus">📷</span>
                  </span>
                  <span className="mini-name">Match my watch</span>
                </Link>
              </div>
              {customs.length > 0 && (
                <>
                  <div className="chips-head">
                    <span className="chips-label">From your photos</span>
                  </div>
                  <div className="editor" role="group" aria-label="Your custom dials">
                    {customs.map((c) => (
                      <div key={c.id} className="pick owned">
                        <span className="mini">
                          <CustomDialImg dial={c} alt="" />
                        </span>
                        <span className="mini-name">{c.name}</span>
                        <button className="remove-btn" onClick={() => removeCustom(c.id)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : wearable.length > 0 ? (
            <div className="chips" role="group" aria-label="Your watches">
              {wearable.map((d) => (
                <button
                  key={d.slug}
                  aria-pressed={current === d.slug}
                  className={`chip${current === d.slug ? ' active' : ''}`}
                  onClick={() => setCurrent(d.slug)}
                >
                  <span className="swatch">
                    <DialImg dial={d} alt="" />
                  </span>
                  {d.name}
                </button>
              ))}
            </div>
          ) : null}

          {wearable.length === 0 && !editing && (
            <div className="empty">
              Your collection is empty.
              <br />
              Tap <strong>Edit collection</strong> and pick the watches you own — or{' '}
              <Link href="/studio">photograph yours</Link>.
            </div>
          )}

          {dial && !editing && (
            <div className="stage">
              <div className="phone" key={dial.slug}>
                <DialImg dial={dial} alt={`${dial.name} wallpaper preview`} />
                {now && (
                  <div className={`clock${dial.lightDial ? ' dark-ink' : ''}`}>
                    <div className="date">
                      {now.toLocaleDateString(undefined, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    <div className="time">
                      {now.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </div>
                  </div>
                )}
              </div>

              <h2 className="dial-name">{dial.name}</h2>
              <p className="dial-pairs">
                <span className="fam">{dial.famLabel}</span> · {dial.sub}
              </p>

              <div className="actions">
                <button
                  className={`save-btn${ready ? ' ready' : ''}`}
                  aria-disabled={saving}
                  onClick={primaryAction}
                >
                  {primaryLabel}
                </button>
                <div className="alt-sizes" aria-label="Other sizes">
                  {SIZES.filter(([w, h]) => w !== devW || h !== devH).map(([w, h]) => (
                    <button key={`${w}x${h}`} onClick={() => void prepare(w, h)} aria-disabled={saving}>
                      {w} × {h}
                    </button>
                  ))}
                </div>

                <button className="shortcut-toggle" onClick={() => setShortcutsOpen((o) => !o)} aria-expanded={shortcutsOpen}>
                  {shortcutsOpen ? 'Hide' : 'Set automatically · iOS Shortcut'}
                </button>
                {shortcutsOpen && (
                  <div className="shortcut-panel">
                    <p>
                      One-time setup — in the <strong>Shortcuts</strong> app, create a shortcut
                      named <strong>WatchPaper</strong> with two actions:
                    </p>
                    <ol>
                      <li>
                        <strong>Get Contents of URL</strong> — set its URL to the{' '}
                        <em>Shortcut Input</em> variable
                      </li>
                      <li>
                        <strong>Set Wallpaper Photo</strong> — choose Lock Screen (and turn off
                        “Show Preview”)
                      </li>
                    </ol>
                    <p>
                      Then this button sets your wallpaper in one tap — no share sheet, no Photos:
                    </p>
                    <button className="save-btn" onClick={setViaShortcut}>
                      Set wallpaper via Shortcut
                    </button>
                    <p>
                      For a daily automation (e.g. every morning), use{' '}
                      <button className="linklike" onClick={() => void copyWallpaperUrl()}>
                        copy this dial&rsquo;s wallpaper URL
                      </button>{' '}
                      in a Time-of-Day automation with the same two actions.
                    </p>
                  </div>
                )}

                <p className="hint" role="status">
                  {savedNote ?? ''}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <footer>
        Original artworks inspired by dial finishes — guilloché, embossing, sunray brushing,
        lacquer, silvered relief. Watch model names identify which watch a wallpaper pairs with;
        WatchPaper is not affiliated with, or endorsed by, any watchmaker.
      </footer>
    </main>
  );
}
