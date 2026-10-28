// QA helper: bundle once, render many stills, emit a labeled contact sheet.
// usage: [COMP=VoiceStudioStories] node scripts/stills.mjs <outName> <frame> [frame...]   (scale 0.5)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [, , name, ...framesArg] = process.argv;
const frames = framesArg.map(Number);
const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "work/stills", name);
mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "VoiceStudioFilm" });
const files = [];
for (const f of frames) {
  const out = path.join(outDir, `f${String(f).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output: out, frame: f, scale: 0.5, overwrite: true });
  files.push(out);
}
execFileSync("uv", ["run", "-q", "--with", "pillow", "python", "-I", path.join(root, "scripts/sheet.py"), path.join(root, "work/stills", `${name}.jpg`), ...files], { stdio: "inherit" });
console.log("sheet:", path.join(root, "work/stills", `${name}.jpg`));
