'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addCustomDial } from '@/lib/customDials';
import { FAMILIES, luminance, renderFamily, type FamilyKey } from '@/lib/generator';

const CANVAS = 320; // square working canvas, CSS-scaled
const CIRCLE_R = 118;

type Rgb = [number, number, number];

function kMeans(points: Rgb[], k: number, iterations = 14): Array<{ center: Rgb; size: number }> {
  if (points.length === 0) return [];
  // seed centers spread across the data
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

/** SVG string -> object URL, cached per key while the component lives */
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
  const [hasPhoto, setHasPhoto] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const dragRef = useRef<{ x: number; y: number; pan: [number, number] } | null>(null);
  const [swatches, setSwatches] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string | null>(null);
  const [family, setFamily] = useState<FamilyKey>('sunray');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

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

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setZoom(1);
      setPan([0, 0]);
      setSwatches([]);
      setPrimary(null);
      setSaved(false);
      setHasPhoto(true);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, pan };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scale = CANVAS / rect.width;
    setPan([d.pan[0] + (e.clientX - d.x) * scale, d.pan[1] + (e.clientY - d.y) * scale]);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const extract = () => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const cx = CANVAS / 2;
    const data = ctx.getImageData(0, 0, CANVAS, CANVAS).data;
    const pts: Rgb[] = [];
    for (let y = 0; y < CANVAS; y += 2) {
      for (let x = 0; x < CANVAS; x += 2) {
        if ((x - cx) ** 2 + (y - cx) ** 2 > CIRCLE_R ** 2) continue;
        const i = (y * CANVAS + x) * 4;
        pts.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    const clusters = kMeans(pts, 5);
    // drop specular glare and void-black clusters unless nothing else remains
    const usable = clusters.filter((c) => {
      const l = (0.2126 * c.center[0] + 0.7152 * c.center[1] + 0.0722 * c.center[2]) / 255;
      return l > 0.05 && l < 0.93;
    });
    const list = (usable.length ? usable : clusters).slice(0, 5).map((c) => toHex(c.center));
    setSwatches(list);
    setPrimary(list[0] ?? null);
    setSaved(false);
  };

  const save = () => {
    if (!primary) return;
    const colors = [primary, ...swatches.filter((s) => s !== primary).slice(0, 2)];
    addCustomDial({ name: name.trim() || 'My watch', family, colors });
    setSaved(true);
  };

  const previewSvg = useMemo(
    () => (primary ? renderFamily(family, [primary]) : null),
    [primary, family],
  );
  const previewUrl = useSvgUrl(previewSvg);
  const lightDial = primary ? luminance(primary) > 0.6 : false;

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
        Photograph the dial, frame it in the circle, and WatchPaper draws a wallpaper from its
        exact colours. The photo never leaves your phone.
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
        <>
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
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
            </label>
            <button className="save-btn" onClick={extract}>
              Extract colours
            </button>
          </div>

          {swatches.length > 0 && primary && (
            <>
              <div className="studio-step">
                <span className="chips-label">3 · Dial colour</span>
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
              </div>

              <div className="studio-step">
                <span className="chips-label">4 · Finish</span>
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
              </div>

              <div className="studio-step">
                <span className="chips-label">5 · Preview & save</span>
                <div className="stage">
                  <div className="phone">
                    {previewUrl && <img src={previewUrl} alt="Custom wallpaper preview" />}
                    <div className={`clock${lightDial ? ' dark-ink' : ''}`}>
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
                    <button className="save-btn" onClick={save}>
                      Add to my watches
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      <footer>
        Colour extraction runs entirely on your device — the photo is never uploaded. The
        generated wallpaper is an original artwork in your watch&rsquo;s colours.
      </footer>
    </main>
  );
}
