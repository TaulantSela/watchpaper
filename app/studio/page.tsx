'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addCustomDial, removeCustomDial } from '@/lib/customDials';
import {
  canvasToBlob,
  clockNeedsDarkInk,
  composeWallpaper,
  type DialCrop,
  type PhotoLayout,
} from '@/lib/compose';
import { putPhoto } from '@/lib/photoStore';
import { FAMILIES, luminance, renderFamily, type FamilyKey } from '@/lib/generator';

const CANVAS = 320; // square framing canvas, CSS-scaled
const CIRCLE_R = 118;
const MASTER_W = 1440;
const MASTER_H = 3200;

type Rgb = [number, number, number];
type StyleKey = PhotoLayout | 'redraw';

function kMeans(points: Rgb[], k: number, iterations = 14): Array<{ center: Rgb; size: number }> {
  if (points.length === 0) return [];
  const centers: Rgb[] = Array.from({ length: k }, (_, i) => points[Math.floor((i * points.length) / k)]);
  const assign = new Array<number>(points.length).fill(0);
  for (let it = 0; it < iterations; it++) {
    for (let p = 0; p < points.length; p++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const d =
          (points[p][0] - centers[c][0]) ** 2 +
          (points[p][1] - centers[c][1]) ** 2 +
          (points[p][2] - centers[c][2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      assign[p] = best;
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let p = 0; p < points.length; p++) {
      const s = sums[assign[p]];
      s[0] += points[p][0];
      s[1] += points[p][1];
      s[2] += points[p][2];
      s[3]++;
    }
    sums.forEach((s, c) => {
      if (s[3] > 0) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
  }
  const sizes = centers.map(() => 0);
  assign.forEach((c) => sizes[c]++);
  return centers
    .map((center, i) => ({ center, size: sizes[i] }))
    .filter((c) => c.size > 0)
    .sort((a, b) => b.size - a.size);
}

const toHex = ([r, g, b]: Rgb) =>
  '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

function useSvgUrl(svg: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!svg) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [svg]);
  return url;
}

function FamilyChip({
  family,
  hint,
  colors,
  selected,
  onSelect,
}: {
  family: FamilyKey;
  hint: string;
  colors: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const svg = useMemo(() => renderFamily(family, colors), [family, colors]);
  const url = useSvgUrl(svg);
  const label = FAMILIES.find((f) => f.key === family)!.label;
  return (
    <button className={`pick${selected ? ' owned' : ''}`} onClick={onSelect} aria-pressed={selected} title={hint}>
      <span className="mini">
        {url && <img src={url} alt="" />}
        {selected && <span className="tick">✓</span>}
      </span>
      <span className="mini-name">{label}</span>
    </button>
  );
}

export default function Studio() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const dragRef = useRef<{ x: number; y: number; pan: [number, number] } | null>(null);
  const [crop, setCrop] = useState<DialCrop | null>(null);
  const [styleKey, setStyleKey] = useState<StyleKey>('showcase');
  const [stylePreviews, setStylePreviews] = useState<{ showcase: string; macro: string } | null>(null);
  const [bigPreview, setBigPreview] = useState<string | null>(null);
  const [photoLight, setPhotoLight] = useState(false);
  const [swatches, setSwatches] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [family, setFamily] = useState<FamilyKey>('sunray');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0b0d';
    ctx.fillRect(0, 0, CANVAS, CANVAS);
    const base = Math.max(CANVAS / img.width, CANVAS / img.height) * zoom;
    const dw = img.width * base;
    const dh = img.height * base;
    ctx.drawImage(img, CANVAS / 2 - dw / 2 + pan[0], CANVAS / 2 - dh / 2 + pan[1], dw, dh);
  }, [zoom, pan]);

  useEffect(draw, [draw, hasPhoto]);

  const pendingUrlRef = useRef<string | null>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    const url = URL.createObjectURL(file);
    pendingUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      if (pendingUrlRef.current !== url) return; // a newer photo was picked meanwhile
      pendingUrlRef.current = null;
      URL.revokeObjectURL(url);
      imgRef.current = img;
      setZoom(1);
      setPan([0, 0]);
      setCrop(null);
      setStylePreviews(null);
      setBigPreview(null);
      setSwatches([]);
      setPrimary(null);
      setSaved(false);
      setError(null);
      setHasPhoto(true);
    };
    img.onerror = () => {
      if (pendingUrlRef.current === url) pendingUrlRef.current = null;
      URL.revokeObjectURL(url);
      setError('Could not read that image.');
    };
    img.src = url;
  };

  /** keep the sampling circle fully inside the photo — framing can never fall off the image */
  const clampPan = useCallback((p: [number, number], z: number): [number, number] => {
    const img = imgRef.current;
    if (!img) return p;
    const base = Math.max(CANVAS / img.width, CANVAS / img.height) * z;
    const limX = Math.max(0, (img.width * base) / 2 - CIRCLE_R);
    const limY = Math.max(0, (img.height * base) / 2 - CIRCLE_R);
    return [Math.min(limX, Math.max(-limX, p[0])), Math.min(limY, Math.max(-limY, p[1]))];
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, pan };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS / rect.width;
    setPan(
      clampPan([d.pan[0] + (e.clientX - d.x) * scale, d.pan[1] + (e.clientY - d.y) * scale], zoom),
    );
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onZoom = (z: number) => {
    setZoom(z);
    setPan((p) => clampPan(p, z));
  };

  /** map the on-screen circle back into original image coordinates */
  const cropFromView = (): DialCrop | null => {
    const img = imgRef.current;
    if (!img) return null;
    const base = Math.max(CANVAS / img.width, CANVAS / img.height) * zoom;
    const dx = CANVAS / 2 - (img.width * base) / 2 + pan[0];
    const dy = CANVAS / 2 - (img.height * base) / 2 + pan[1];
    return { cx: (CANVAS / 2 - dx) / base, cy: (CANVAS / 2 - dy) / base, r: CIRCLE_R / base };
  };

  const extractPalette = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const c = CANVAS / 2;
    const data = ctx.getImageData(0, 0, CANVAS, CANVAS).data;
    const pts: Rgb[] = [];
    for (let y = 0; y < CANVAS; y += 2) {
      for (let x = 0; x < CANVAS; x += 2) {
        if ((x - c) ** 2 + (y - c) ** 2 > CIRCLE_R ** 2) continue;
        const i = (y * CANVAS + x) * 4;
        pts.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    const clusters = kMeans(pts, 5);
    const usable = clusters.filter((cl) => {
      const l = (0.2126 * cl.center[0] + 0.7152 * cl.center[1] + 0.0722 * cl.center[2]) / 255;
      return l > 0.05 && l < 0.93;
    });
    const list = (usable.length ? usable : clusters).slice(0, 5).map((cl) => toHex(cl.center));
    setSwatches(list);
    setPrimary(list[0] ?? null);
  };

  const confirmFraming = () => {
    const img = imgRef.current;
    const c = cropFromView();
    if (!img || !c) return;
    setCrop(c);
    setSaved(false);
    setError(null);
    extractPalette();
    const mkPreview = (layout: PhotoLayout, w: number, h: number) =>
      composeWallpaper(img, c, layout, w, h).toDataURL('image/jpeg', 0.85);
    setStylePreviews({
      showcase: mkPreview('showcase', 180, 391),
      macro: mkPreview('macro', 180, 391),
    });
  };

  // big preview for photo styles; redraw styles preview via SVG below
  useEffect(() => {
    const img = imgRef.current;
    if (!crop || !img || styleKey === 'redraw') {
      setBigPreview(null);
      return;
    }
    const canvas = composeWallpaper(img, crop, styleKey, 396, 860);
    previewCanvasRef.current = canvas;
    setPhotoLight(clockNeedsDarkInk(canvas));
    setBigPreview(canvas.toDataURL('image/jpeg', 0.88));
  }, [crop, styleKey]);

  // a save belongs to the exact style/colour/family/name it was made with
  useEffect(() => {
    setSaved(false);
  }, [styleKey, primary, family, name]);

  const redrawSvg = useMemo(
    () => (styleKey === 'redraw' && primary ? renderFamily(family, [primary]) : null),
    [styleKey, primary, family],
  );
  const redrawUrl = useSvgUrl(redrawSvg);
  const redrawLight = primary ? luminance(primary) > 0.6 : false;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (styleKey === 'redraw') {
        if (!primary) return;
        const colors = [primary, ...swatches.filter((s) => s !== primary).slice(0, 2)];
        addCustomDial({ kind: 'params', name: name.trim() || 'My watch', family, colors });
      } else {
        const img = imgRef.current;
        if (!img || !crop) return;
        const master = composeWallpaper(img, crop, styleKey, MASTER_W, MASTER_H);
        const blob = await canvasToBlob(master, 'image/jpeg', 0.92);
        const dial = addCustomDial({ kind: 'photo', name: name.trim() || 'My watch', light: photoLight });
        try {
          await putPhoto(dial.id, blob);
        } catch (err) {
          removeCustomDial(dial.id); // don't leave a dial that can't render
          throw err;
        }
      }
      setSaved(true);
    } catch (err) {
      setError((err as Error).message || 'Could not save the wallpaper.');
    } finally {
      setBusy(false);
    }
  };

  const previewLight = styleKey === 'redraw' ? redrawLight : photoLight;
  const previewSrc = styleKey === 'redraw' ? redrawUrl : bigPreview;

  return (
    <main className="wrap">
      <p className="eyebrow">
        <Link href="/" className="back">
          ← WatchPaper
        </Link>
      </p>
      <h1>
        Match <em>your</em> watch.
      </h1>
      <p className="sub">
        Photograph the dial or pick a photo, frame it in the circle, and WatchPaper turns it into
        a wallpaper. Everything runs on your phone — the photo is never uploaded.
      </p>

      <div className="studio-step">
        <span className="chips-label">1 · Photo</span>
        <div className="photo-btns">
          <label className="file-btn">
            {hasPhoto ? 'Retake photo' : 'Take a photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.currentTarget.value = '';
              }}
            />
          </label>
          <label className="file-btn">
            Choose from gallery
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {hasPhoto && (
        <div className="studio-step">
          <span className="chips-label">2 · Frame the dial</span>
          <div className="crop-wrap">
            <canvas
              ref={canvasRef}
              width={CANVAS}
              height={CANVAS}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
            <div className="crop-ring" aria-hidden="true" />
          </div>
          <label className="zoom">
            Zoom
            <input
              type="range"
              min="1"
              max="4"
              step="0.02"
              value={zoom}
              onChange={(e) => onZoom(parseFloat(e.target.value))}
            />
          </label>
          <button className="save-btn" onClick={confirmFraming}>
            {crop ? 'Update framing' : 'Use this framing'}
          </button>
        </div>
      )}

      {crop && stylePreviews && (
        <div className="studio-step">
          <span className="chips-label">3 · Style</span>
          <div className="style-cards" role="group" aria-label="Wallpaper style">
            <button
              className={`style-card${styleKey === 'showcase' ? ' active' : ''}`}
              onClick={() => setStyleKey('showcase')}
              aria-pressed={styleKey === 'showcase'}
            >
              <img src={stylePreviews.showcase} alt="" />
              <span>Showcase</span>
              <small>your dial, floating</small>
            </button>
            <button
              className={`style-card${styleKey === 'macro' ? ' active' : ''}`}
              onClick={() => setStyleKey('macro')}
              aria-pressed={styleKey === 'macro'}
            >
              <img src={stylePreviews.macro} alt="" />
              <span>Macro</span>
              <small>the dial, full bleed</small>
            </button>
            <button
              className={`style-card${styleKey === 'redraw' ? ' active' : ''}`}
              onClick={() => setStyleKey('redraw')}
              aria-pressed={styleKey === 'redraw'}
            >
              {primary && (
                <span className="style-swatch" style={{ background: primary }} aria-hidden="true" />
              )}
              <span>Re-draw</span>
              <small>a texture in its colours</small>
            </button>
          </div>

          {styleKey === 'redraw' && primary && (
            <>
              <div className="swatches" role="group" aria-label="Extracted colours">
                {swatches.map((s) => (
                  <button
                    key={s}
                    className={`swatch-btn${s === primary ? ' active' : ''}`}
                    style={{ background: s }}
                    onClick={() => setPrimary(s)}
                    aria-pressed={s === primary}
                    aria-label={`Colour ${s}`}
                  />
                ))}
              </div>
              <div className="editor">
                {FAMILIES.map((f) => (
                  <FamilyChip
                    key={f.key}
                    family={f.key}
                    hint={f.hint}
                    colors={[primary]}
                    selected={family === f.key}
                    onSelect={() => setFamily(f.key)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {crop && previewSrc && (
        <div className="studio-step">
          <span className="chips-label">4 · Preview & save</span>
          <div className="stage">
            <div className="phone">
              <img src={previewSrc} alt="Wallpaper preview" />
              <div className={`clock${previewLight ? ' dark-ink' : ''}`}>
                <div className="date">Your watch</div>
                <div className="time">10:09</div>
              </div>
            </div>
            <input
              className="name-input"
              placeholder="Name it — e.g. My Seamaster"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={28}
            />
            {saved ? (
              <Link href="/" className="save-btn done-link">
                Added ✓ — back to my watches
              </Link>
            ) : (
              <button className="save-btn" aria-disabled={busy} onClick={() => void save()}>
                {busy ? 'Rendering…' : 'Add to my watches'}
              </button>
            )}
            <p className="hint" role="status">
              {error ?? ''}
            </p>
          </div>
        </div>
      )}

      <footer>
        Photos are processed entirely on your device and stored only in this browser — nothing is
        uploaded. Photo wallpapers therefore can&rsquo;t use the Shortcuts URL; save them via the
        share sheet instead.
      </footer>
    </main>
  );
}
