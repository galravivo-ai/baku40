import "server-only";
import { COLLECTION_FILES, getAreas, getAttractionsPage, getCollection, type CollectionKey } from "./content";

export type IndexEntry = { id: string; group: string; name: string; meta: string; href: string; text: string };

/** Everything searchable / saveable on the site, built at build time. */
export function buildSearchIndex(): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const key of Object.keys(COLLECTION_FILES) as CollectionKey[]) {
    const c = getCollection(key);
    for (const item of c.items) {
      out.push({
        id: `${key}:${item.slug}`,
        group: c.h1,
        name: item.name,
        meta: item.meta,
        href: item.url ?? `${c.url}?q=${encodeURIComponent(item.name)}`,
        text: [item.name, item.meta, item.text, item.area].filter(Boolean).join(" "),
      });
    }
  }
  const attractions = getAttractionsPage();
  for (const a of attractions.items) {
    out.push({
      id: `attractions:${a.id}`,
      group: attractions.h1,
      name: a.name,
      meta: `${a.area} · ${a.dur}`,
      href: `${attractions.url}?q=${encodeURIComponent(a.name)}`,
      text: [a.name, a.area, a.note, ...a.tags].join(" "),
    });
  }
  for (const area of getAreas()) {
    out.push({
      id: `areas:${area.slug}`,
      group: "אזורי העיר",
      name: area.name,
      meta: area.subtitle ?? "",
      href: area.url,
      text: [area.name, area.subtitle ?? ""].join(" "),
    });
  }
  return out;
}
