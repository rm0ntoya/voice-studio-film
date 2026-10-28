export const W = 1920;
export const H = 1080;
export const FPS = 60;

export const C = {
  ink: "#0C0B0E",
  ink2: "#16141A",
  ink3: "#1F1C24",
  line: "#2B2830",
  bone: "#F4EFE6",
  muted: "#8C867E",
  ember: "#FF5A36",
  emberSoft: "#FF8A5C",
  emberDeep: "#C9381C",
  iris: "#B7A6FF",
  leaf: "#7BE0A6",
} as const;

export const TYPE = {
  mega: 340,
  xl: 168,
  l: 120,
  m: 88,
  title: 64,
  bodyL: 44,
  body: 32,
  label: 20,
} as const;

export const GRID = {
  margin: 120,
  gutter: 24,
  cols: 12,
  colW: 118,
  safeY: 96,
} as const;

/** x coordinate of the left edge of grid column n (0-based). */
export const col = (n: number) => GRID.margin + n * (GRID.colW + GRID.gutter);
/** width spanned by n columns (including inner gutters). */
export const span = (n: number) => n * GRID.colW + (n - 1) * GRID.gutter;

export const RADIUS = { card: 28, pill: 999, small: 14 } as const;
export const SHADOW = "0 40px 80px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.03) inset";
