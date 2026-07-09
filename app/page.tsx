'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ART_H, ART_W, DIALS, SIZES, type Dial } from '@/lib/dials';

const COLLECTION_KEY = 'watchpaper.collection';
const CURRENT_KEY = 'watchpaper.current';

function dialBySlug(slug: string | null): Dial | undefined {
  return DIALS.find((d) => d.slug === slug);
}

function readCollection(): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '[]');
  } catch {
    parsed = [];
  }
  if (!Array.isArray(parsed)) return [];
  // drop non-strings and slugs that no longer exist, so bad state self-heals
  return parsed.filter((s): s is string => typeof s === 'string' && DIALS.some((d) => d.slug === s));
}

async function renderPng(dial: Dial, w: number, h: number): Promise<Blob> {
  const xml = await fetch(`/dials/${dial.file}.svg`).then((r) => r.text());
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
  const [collection, setCollection] = useState<string[] | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState<ReadyFile | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const noteTimer = useRef<number | null>(null);
  const now = useClock();
  const [devW, devH] = useDeviceSize();

  const note = useCallback((msg: string | null, ttl = 6000) => {
    if (noteTimer.current) clearTimeout(noteTimer.current);
    setSavedNote(msg);
    if (msg) noteTimer.current = window.setTimeout(() => setSavedNote(null), ttl);
  }, []);

  useEffect(() => {
    const owned = readCollection();
    setCollection(owned);
    setEditing(owned.length === 0);
    const last = localStorage.getItem(CURRENT_KEY);
    setCurrent(owned.includes(last ?? '') ? last : owned[0] ?? null);
  }, []);

  useEffect(() => {
    if (collection !== null) localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    if (current) localStorage.setItem(CURRENT_KEY, current);
  }, [current]);

  // a rendered-but-unshared file belongs to the dial it was rendered from
  useEffect(() => {
    setReady(null);
  }, [current]);

  const dial = dialBySlug(current);
  const owned = useMemo(() => DIALS.filter((d) => collection?.includes(d.slug)), [collection]);

  const toggleOwned = useCallback((slug: string) => {
    setCollection((prev) => {
      const list = prev ?? [];
      const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
      setCurrent((c) => (next.includes(c ?? '') ? c : next[0] ?? null));
      return next;
    });
  }, []);

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
          // iOS: don't share here — the tap's user activation has expired during
          // rendering and share() would be blocked. Hold the file for a second tap.
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
      if ((err as DOMException).name === 'AbortError') {
        // user closed the sheet; keep the file ready for another tap
        return;
      }
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

      {collection !== null && (
        <>
          <div className="chips-head">
            <span className="chips-label">My watches</span>
            <button className="edit-btn" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done' : 'Edit collection'}
            </button>
          </div>

          {editing ? (
            <div className="editor" role="group" aria-label="Choose the watches you own">
              {DIALS.map((d) => {
                const isOwned = collection.includes(d.slug);
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
            </div>
          ) : owned.length > 0 ? (
            <div className="chips" role="group" aria-label="Your watches">
              {owned.map((d) => (
                <button
                  key={d.slug}
                  aria-pressed={current === d.slug}
                  className={`chip${current === d.slug ? ' active' : ''}`}
                  onClick={() => setCurrent(d.slug)}
                >
                  <span className="swatch">
                    <img src={`/dials/${d.file}.svg`} alt="" />
                  </span>
                  {d.name}
                </button>
              ))}
            </div>
          ) : null}

          {owned.length === 0 && !editing && (
            <div className="empty">
              Your collection is empty.
              <br />
              Tap <strong>Edit collection</strong> and pick the watches you own.
            </div>
          )}

          {dial && !editing && (
            <div className="stage">
              <div className="phone" key={dial.slug}>
                <img src={`/dials/${dial.file}.svg`} alt={`${dial.name} wallpaper preview`} />
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
                <span className="fam">{dial.family}</span> · pairs with the {dial.pairs}
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
