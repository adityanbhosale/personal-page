/**
 * Dark-theme palette for the React islands.
 *
 * These mirror the CSS custom properties in src/layouts/Base.astro. They live
 * here as literals rather than `var(--…)` because Recharts writes colours out
 * as SVG presentation attributes, where `var()` does not resolve.
 */
export const PALETTE = {
  bg: '#0c0c0d',
  surface: '#17171a',
  ink: '#e8e6e1',
  inkMuted: '#b3aea6',
  inkFaint: '#8a857e',
  rule: '#2a2a30',
  grid: '#1c1c20',
  accent: '#bfa07a',
  positive: '#63c98a',
};
