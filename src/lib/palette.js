/**
 * Palette for the React islands.
 *
 * Recharts writes colours out as SVG presentation attributes, where `var()`
 * never resolves — so instead of using custom properties directly, we read
 * their computed values off :root and hand Recharts plain strings.
 *
 * The values below are only fallbacks for server rendering and for the case
 * where a property is missing; the live source of truth is the token set in
 * src/layouts/Base.astro, which is what makes these follow the theme.
 */
import { useEffect, useState } from 'react';

const FALLBACK = {
  bg: '#0c0c0d',
  surface: '#17171a',
  ink: '#e8e6e1',
  inkMuted: '#b3aea6',
  inkFaint: '#8a857e',
  rule: '#2a2a30',
  grid: '#1c1c20',
  accent: '#bfa07a',
  positive: '#63c98a',
  shadow: 'rgba(0, 0, 0, 0.55)',
  series: ['#6ea8fe', '#e8796f', '#63c98a', '#f0913f'],
};

const VARS = {
  bg: '--bg',
  surface: '--chart-surface',
  ink: '--chart-ink',
  inkMuted: '--chart-ink-muted',
  inkFaint: '--chart-ink-faint',
  rule: '--chart-rule',
  grid: '--chart-grid',
  accent: '--accent',
  positive: '--chart-positive',
  shadow: '--chart-shadow',
};

export function readPalette() {
  if (typeof window === 'undefined' || !window.getComputedStyle) return FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const get = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  const out = {};
  for (const key of Object.keys(VARS)) out[key] = get(VARS[key], FALLBACK[key]);
  out.series = FALLBACK.series.map((fb, i) => get(`--series-${i + 1}`, fb));
  return out;
}

/** Re-reads the palette whenever the theme flips on <html>. */
export function usePalette() {
  const [palette, setPalette] = useState(FALLBACK);
  useEffect(() => {
    const sync = () => setPalette(readPalette());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return palette;
}

/** Static import kept for any non-React consumer; prefer usePalette(). */
export const PALETTE = FALLBACK;
