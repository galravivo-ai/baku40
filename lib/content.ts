import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import { isBookingPhoto, isPublishable, isRendering } from "./image-policy.mjs";
import {
  areasSchema,
  collectionSchema,
  imageSourcesSchema,
  redirectsSchema,
  siteSchema,
  type Area,
  type Collection,
  type ImageSources,
  type Item,
  type Site,
} from "./schema";

// The single read layer for site content. Pages and components get content
// only through these functions, so the source (JSON files today, Payload in
// stage 2) can change without touching the UI.

const CONTENT_DIR = join(process.cwd(), "content");

function load<S extends z.ZodType>(file: string, schema: S): z.infer<S> {
  const path = join(CONTENT_DIR, file);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`content/${file}: קובץ JSON לא תקין: ${(err as Error).message}`);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`content/${file}: התוכן לא עבר ולידציה:\n${issues}`);
  }
  return result.data;
}

const cache = new Map<string, unknown>();
function cached<T>(key: string, fn: () => T): T {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key) as T;
}

export const COLLECTION_FILES = {
  hotels: "hotels.json",
  restaurants: "restaurants.json",
  kosher: "kosher.json",
  itineraries: "itineraries.json",
  shopping: "shopping.json",
  "day-trips": "day-trips.json",
} as const;
export type CollectionKey = keyof typeof COLLECTION_FILES;

export function getSite(): Site {
  return cached("site", () => load("site.json", siteSchema));
}

export function getAreas(): Area[] {
  return cached("areas", () => load("areas.json", areasSchema).items);
}

export function getRedirects() {
  return cached("redirects", () => load("redirects.json", redirectsSchema).items);
}

export function getImageSources(): ImageSources {
  return cached("image-sources", () => load("image-sources.json", imageSourcesSchema));
}

function checkCollection(file: string, c: Collection) {
  const seen = new Set<string>();
  for (const item of c.items) {
    if (seen.has(item.slug)) throw new Error(`content/${file}: slug כפול "${item.slug}"`);
    seen.add(item.slug);
  }
}

function sortItems(c: Collection): Item[] {
  if (c.sortBy !== "reviews desc") return c.items;
  return [...c.items].sort(
    (a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.reviews ?? 0) - (a.reviews ?? 0),
  );
}

export function getCollection(key: CollectionKey): Collection {
  return cached(`collection:${key}`, () => {
    const file = COLLECTION_FILES[key];
    const c = load(file, collectionSchema);
    checkCollection(file, c);
    return { ...c, items: sortItems(c) };
  });
}

export function getAllCollections(): Collection[] {
  return (Object.keys(COLLECTION_FILES) as CollectionKey[]).map(getCollection);
}

/**
 * Titles and descriptions must be unique across the site (SEO spec §1).
 * Called from the root layout so every build checks it.
 */
export function assertUniqueSeo() {
  cached("seo-check", () => {
    const titles = new Map<string, string>();
    const descs = new Map<string, string>();
    const add = (map: Map<string, string>, value: string | null | undefined, where: string, kind: string) => {
      if (!value) return;
      const prev = map.get(value);
      if (prev) throw new Error(`${kind} כפול: "${value}" מופיע גם ב-${prev} וגם ב-${where}`);
      map.set(value, where);
    };
    const site = getSite();
    for (const p of site.staticPages) {
      add(titles, p.metaTitle, `site.json ${p.url}`, "metaTitle");
      add(descs, p.metaDescription, `site.json ${p.url}`, "metaDescription");
    }
    for (const c of getAllCollections()) {
      add(titles, c.seo.metaTitle, c.url, "metaTitle");
      add(descs, c.seo.metaDescription, c.url, "metaDescription");
      // Records only get their own page (and so their own <title>) when they have a url.
      for (const item of c.items) {
        if (!item.url) continue;
        add(titles, item.seo.metaTitle, item.url, "metaTitle");
        add(descs, item.seo.metaDescription, item.url, "metaDescription");
      }
    }
    return true;
  });
}

export type PhotoInfo = { src: string; alt: string; isRendering: boolean; credit?: string } | null;

/** Returns the photo only when it may be shown publicly; otherwise null (placeholder). */
export function getPhoto(photo: string, photoNote: string, alt: string): PhotoInfo {
  const sources = getImageSources();
  const { showBookingPhotos, showUndocumentedPhotos } = getSite();
  const options = { showBookingPhotos, showUndocumentedPhotos };
  if (!isPublishable(photo, photoNote, sources, options)) return null;
  const src = /^https?:\/\//.test(photo) ? photo : `/${photo.replace(/^\//, "")}`;
  return {
    src,
    alt,
    isRendering: isRendering(photo, sources),
    credit: isBookingPhoto(photo) ? "Booking.com" : undefined,
  };
}

export type VerifyKind = "ok" | "partial" | "edit" | "pending" | "none";

/** Verification status from the start of the `verify` text (design 8a–8f). */
export function verifyKind(verify: string): VerifyKind {
  const v = verify.trim();
  if (!v) return "none";
  if (v.startsWith("אומת חלקית")) return "partial";
  if (v.startsWith("נבדק") || v.startsWith("אומת")) return "ok";
  if (v.startsWith("מסלול עריכתי")) return "edit";
  if (v.startsWith("ממתין") || v.startsWith("נטען")) return "pending";
  return "none";
}

/**
 * The collection's `count` text with its numbers recomputed from the records,
 * e.g. "12 רשומות · 7 מאומתות · 3 חלקיות · 2 ממתינות".
 */
export function countText(c: Collection): string {
  const kinds = c.items.map((i) => verifyKind(i.verify));
  const n = (k: VerifyKind) => kinds.filter((x) => x === k).length;
  const byWord: [RegExp, number][] = [
    [/\d+(?=\s*מאומת)/, n("ok")],
    [/\d+(?=\s*חלקי)/, n("partial")],
    [/\d+(?=\s*ממתינ)/, n("pending")],
  ];
  let out = c.count.replace(/^\d+/, String(c.items.length));
  for (const [re, value] of byWord) out = out.replace(re, String(value));
  return out;
}

export function areaFor(item: Item): Area | undefined {
  return item.areaSlug ? getAreas().find((a) => a.slug === item.areaSlug) : undefined;
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSite().baseUrl).toString();
}
