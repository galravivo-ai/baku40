// Copies the logos and the publishable photos from design/assets into
// public/assets. Unlicensed photos are never copied, so they cannot reach the
// deployed site. Booking.com hotel photos are copied only when
// content/site.json has "showBookingPhotos": true.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { isPublishable } from "../lib/image-policy.mjs";

const root = join(import.meta.dirname, "..");
const src = join(root, "design", "assets");
const dest = join(root, "public", "assets");

const raw = JSON.parse(readFileSync(join(root, "content", "image-sources.json"), "utf8"));
const files = Object.fromEntries(Object.entries(raw).filter(([k]) => /\.(png|jpe?g|webp|avif)$/i.test(k)));
const sources = { files, remote: raw.images ?? [] };
const site = JSON.parse(readFileSync(join(root, "content", "site.json"), "utf8"));
const options = {
  showBookingPhotos: site.showBookingPhotos === true,
  showUndocumentedPhotos: site.showUndocumentedPhotos === true,
};

rmSync(dest, { recursive: true, force: true });
mkdirSync(join(dest, "photos"), { recursive: true });

for (const logo of ["baku40-logo.png", "baku40-logo-skyblue.png"]) {
  cpSync(join(src, logo), join(dest, logo));
}

const copied = [];
for (const rel of ["photos", "photos/hotels"]) {
  const dir = join(src, rel);
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (!/\.(png|jpe?g|webp|avif)$/i.test(name)) continue;
    if (isPublishable(`assets/${rel}/${name}`, "", sources, options)) {
      mkdirSync(join(dest, rel), { recursive: true });
      cpSync(join(dir, name), join(dest, rel, name));
      copied.push(`${rel}/${name}`);
    }
  }
}
console.log(`sync-assets: ${copied.length} photos copied (${copied.join(", ") || "none"})`);
