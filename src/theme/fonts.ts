import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadGeistPixel } from "@remotion/google-fonts/GeistPixel";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

export const SANS = loadGeist("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const MONO = loadGeistMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const SERIF = loadInstrumentSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;

export const PIXEL = loadGeistPixel("normal", { subsets: ["latin"] }).fontFamily;

export type FontRole = "sans" | "serif" | "mono" | "pixel";
export const FONT: Record<FontRole, string> = {
  sans: SANS,
  serif: SERIF,
  mono: MONO,
  pixel: PIXEL,
};
