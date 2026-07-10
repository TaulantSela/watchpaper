'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CATALOG, type CatalogBrand, type CatalogModel, type CatalogType, type CatalogVariant } from '@/lib/catalog';
import { addCustomDial } from '@/lib/customDials';
import { FAMILIES, luminance, renderFamily } from '@/lib/generator';

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

function VariantTile({
  variant,
  selected,
  onSelect,
}: {
  variant: CatalogVariant;
  selected: boolean;
  onSelect: () => void;
}) {
  const svg = useMemo(() => renderFamily(variant.family, variant.colors), [variant]);
  const url = useSvgUrl(svg);
  return (
    <button className={`pick${selected ? ' owned' : ''}`} onClick={onSelect} aria-pressed={selected}>
      <span className="mini">
        {url && <img src={url} alt="" />}
        {selected && <span className="tick">✓</span>}
      </span>
      <span className="mini-name">{variant.label}</span>
    </button>
  );
}

export default function AddWatch() {
  const [brand, setBrand] = useState<CatalogBrand | null>(null);
  const [model, setModel] = useState<CatalogModel | null>(null);
  const [type, setType] = useState<CatalogType | null>(null);
  const [variant, setVariant] = useState<CatalogVariant | null>(null);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const pickBrand = (b: CatalogBrand) => {
    setBrand(b);
    setModel(b.models.length === 1 ? b.models[0] : null);
    setType(null);
    setVariant(null);
    setSaved(false);
  };
  const pickModel = (m: CatalogModel) => {
    setModel(m);
    setType(m.types.length === 1 ? m.types[0] : null);
    setVariant(null);
    setSaved(false);
  };
  const pickType = (t: CatalogType) => {
    setType(t);
    setVariant(null);
    setSaved(false);
  };
  const pickVariant = (v: CatalogVariant) => {
    setVariant(v);
    setSaved(false);
  };

  // models with a single type skip the type step entirely
  useEffect(() => {
    if (model && model.types.length === 1 && type !== model.types[0]) setType(model.types[0]);
  }, [model, type]);

  const typeIsReal = (t: CatalogType | null) => !!t && t.label.toLowerCase() !== 'standard';

  const pairs = useMemo(() => {
    if (!brand || !model || !variant) return '';
    const typePart = typeIsReal(type) ? ` ${type!.label.replace(/\s*\(.*\)$/, '')}` : '';
    return `${brand.label} ${model.label}${typePart}, ${variant.label.toLowerCase()}`;
  }, [brand, model, type, variant]);

  const defaultName = useMemo(() => {
    if (!model || !variant) return '';
    const colour = variant.label.split(' ')[0];
    return `${model.label} ${colour}`.slice(0, 28);
  }, [model, variant]);

  const previewSvg = useMemo(
    () => (variant ? renderFamily(variant.family, variant.colors) : null),
    [variant],
  );
  const previewUrl = useSvgUrl(previewSvg);
  const lightDial = variant ? luminance(variant.colors[0]) > 0.6 : false;

  const save = () => {
    if (!variant) return;
    addCustomDial({
      kind: 'params',
      name: (name.trim() || defaultName || 'My watch').slice(0, 28),
      family: variant.family,
      colors: variant.colors,
      pairs,
    });
    setSaved(true);
  };

  return (
    <main className="wrap">
      <p className="eyebrow">
        <Link href="/" className="back">
          ← WatchPaper
        </Link>
      </p>
      <h1>
        Find <em>your</em> watch.
      </h1>
      <p className="sub">
        Brand, model, movement, dial — and the matching wallpaper is drawn for you.
      </p>

      <div className="studio-step">
        <span className="chips-label">1 · Brand</span>
        <div className="chips wrap-chips" role="group" aria-label="Brand">
          {CATALOG.map((b) => (
            <button
              key={b.id}
              className={`chip${brand?.id === b.id ? ' active' : ''}`}
              aria-pressed={brand?.id === b.id}
              onClick={() => pickBrand(b)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {brand && (
        <div className="studio-step">
          <span className="chips-label">2 · Model</span>
          <div className="chips wrap-chips" role="group" aria-label="Model">
            {brand.models.map((m) => (
              <button
                key={m.id}
                className={`chip${model?.id === m.id ? ' active' : ''}`}
                aria-pressed={model?.id === m.id}
                onClick={() => pickModel(m)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {model && model.types.length > 1 && (
        <div className="studio-step">
          <span className="chips-label">3 · Movement / type</span>
          <div className="chips wrap-chips" role="group" aria-label="Movement or type">
            {model.types.map((t) => (
              <button
                key={t.id}
                className={`chip${type?.id === t.id ? ' active' : ''}`}
                aria-pressed={type?.id === t.id}
                onClick={() => pickType(t)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {type && (
        <div className="studio-step">
          <span className="chips-label">{model && model.types.length > 1 ? '4' : '3'} · Dial</span>
          <div className="editor" role="group" aria-label="Dial variant">
            {type.variants.map((v) => (
              <VariantTile key={v.id} variant={v} selected={variant?.id === v.id} onSelect={() => pickVariant(v)} />
            ))}
          </div>
        </div>
      )}

      {variant && (
        <div className="studio-step">
          <span className="chips-label">Preview & save</span>
          <div className="stage">
            <div className="phone">
              {previewUrl && <img src={previewUrl} alt={`${variant.label} wallpaper preview`} />}
              <div className={`clock${lightDial ? ' dark-ink' : ''}`}>
                <div className="date">{pairs}</div>
                <div className="time">10:09</div>
              </div>
            </div>
            <p className="dial-pairs">
              <span className="fam">{FAMILIES.find((f) => f.key === variant.family)?.label}</span> ·
              pairs with the {pairs}
            </p>
            <input
              className="name-input"
              placeholder={defaultName || 'Name it'}
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
      )}

      <footer>
        Brand and model names identify which watch a wallpaper pairs with. WatchPaper wallpapers
        are original artworks; the app is not affiliated with, or endorsed by, any watchmaker.
      </footer>
    </main>
  );
}
