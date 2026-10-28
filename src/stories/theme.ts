/** Vertical (Stories / Reels) canvas. Brand tokens come from ../theme/tokens. */
export const SW = 1080;
export const SH = 1920;

/** Safe zone: Instagram/TikTok chrome covers ~250 px on top and ~340 px at the bottom. */
export const SAFE = { top: 260, bottom: 1580, x: 80 } as const;
export const SAFE_MID = (SAFE.top + SAFE.bottom) / 2;
export const INNER_W = SW - SAFE.x * 2;

export const ST = {
  mega: 300,
  hero: 168,
  big: 132,
  mid: 96,
  title: 72,
  body: 50,
  small: 38,
  label: 26,
} as const;

/** Scene palettes — the background changes every beat. */
export const PAL = {
  ink: "#0C0B0E",
  night: "#120F2E",
  nightGlow: "#3B2F8F",
  leaf: "#7BE0A6",
  leafDeep: "#1E8F5A",
  wa: "#0E3B2C",
  waGlow: "#25D366",
  ember: "#FF5A36",
  emberSoft: "#FF8A5C",
  emberDeep: "#C9381C",
  iris: "#B7A6FF",
  irisDeep: "#3A2A86",
  bone: "#F4EFE6",
  sand: "#E9DFCF",
  sun: "#FFC15E",
} as const;
