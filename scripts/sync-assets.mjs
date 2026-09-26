// Copies the logos and the licensed photos from design/assets into
// public/assets. Unlicensed photos (including all Booking.com images) are
// never copied, so they cannot reach the deployed site.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { isPublishable } from "../lib/image-policy.mjs";

const root = join(import.meta.dirname, "..");
const src = join(root, "design", "assets");
const dest = join(root, "public", "assets");

const raw = JSON.parse(readFileSync(join(root, "content", "image-sources.json"), "utf8"));
const files = Object.fromEntries(Object.entries(raw).filter(([k]) => /\.(png|jpe?g|webp|avif)$/i.test(k)));
const sources = { files, remote: raw.images ?? [] };

rmSync(dest, { recursive: true, force: true });
mkdirSync(join(dest, "photos"), { recursive: true });

for (const logo of ["baku40-logo.png", "baku40-logo-skyblue.png"]) {
  cpSync(join(src, logo), join(dest, logo));
}

const copied = [];
for (const name of readdirSync(join(src, "photos"))) {
  const path = join(src, "photos", name);
  if (!existsSync(path) || !/\.(png|jpe?g|webp|avif)$/i.test(name)) continue;
  if (isPublishable(`assets/photos/${name}`, "", sources)) {
    cpSync(path, join(dest, "photos", name));
    copied.push(name);
  }
}
console.log(`sync-assets: ${copied.length} licensed photos copied (${copied.join(", ") || "none"})`);
