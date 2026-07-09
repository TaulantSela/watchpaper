'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ART_H, ART_W, DIALS, SIZES, type Dial } from '@/lib/dials';

const COLLECTION_KEY = 'watchpaper.collection';
const CURRENT_KEY = 'watchpaper.current';

function dialBySlug(slug: string | null): Dial | undefined {
  return DIALS.find((d) => d.slug === slug);
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

async function saveWallpaper(dial: Dial, w: number, h: number): Promise<'shared' | 'downloaded'> {
  const blob = await renderPng(dial, w, h);
  const file = new File([blob], `${dial.slug}-${w}x${h}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (err) {
      // user closed the share sheet — not an error, and don't force a download
      if ((err as DOMException).name === 'AbortError') return 'shared';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
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

export default function Home() {
  const [collection, setCollection] = useState<string[] | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const now = useClock();
  const [devW, devH] = useDeviceSize();

  useEffect(() => {
    let owned: string[] = [];
    try {
      owned = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '[]');
    } catch {
      owned = [];
    }
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

  const save = useCallback(
    async (w: number, h: number) => {
      if (!dial || saving) return;
      setSaving(true);
      setSavedNote(null);
      try {
        const how = await saveWallpaper(dial, w, h);
        setSavedNote(
          how === 'shared'
            ? 'Sent to the share sheet — choose “Save Image” to add it to Photos.'
            : `Saved ${dial.name} at ${w} × ${h}.`,
        );
      } catch (err) {
        setSavedNote((err as Error).message);
      } finally {
        setSaving(false);
        setTimeout(() => setSavedNote(null), 5000);
      }
    },
    [dial, saving],
  );

  if (collection === null) return null; // avoid flash before localStorage loads

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
        <div className="chips" role="tablist" aria-label="Your watches">
          {owned.map((d) => (
            <button
              key={d.slug}
              role="tab"
              aria-selected={current === d.slug}
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
                  {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="time">
                  {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>
            )}
          </div>

          <h2 className="dial-name">{dial.name}</h2>
          <p className="dial-pairs">
            <span className="fam">{dial.family}</span> · pairs with the {dial.pairs}
          </p>

          <div className="actions">
            <button className="save-btn" disabled={saving} onClick={() => save(devW, devH)}>
              {saving ? 'Rendering…' : `Save wallpaper · ${devW} × ${devH}`}
            </button>
            <div className="alt-sizes" aria-label="Other sizes">
              {SIZES.filter(([w, h]) => w !== devW || h !== devH).map(([w, h]) => (
                <button key={`${w}x${h}`} onClick={() => save(w, h)} disabled={saving}>
                  {w} × {h}
                </button>
              ))}
            </div>
            {savedNote && (
              <p className="hint" role="status">
                {savedNote}
              </p>
            )}
          </div>
        </div>
      )}

      <footer>
        Original artworks inspired by dial finishes — guilloché, embossing, sunray brushing,
        lacquer, silvered relief. Watch model names identify which watch a wallpaper pairs with;
        WatchPaper is not affiliated with, or endorsed by, any watchmaker.
      </footer>
    </main>
  );
}
