import "server-only";
import { COLLECTION_FILES, getAreas, getAttractionsPage, getCollection, type CollectionKey, getTravelTopics } from "./content";

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
        name: item.nameHe ? `${item.nameHe} (${item.name})` : item.name,
        meta: item.meta,
        href: item.url ?? `${c.url}?q=${encodeURIComponent(item.name)}`,
        text: [item.name, item.nameHe, item.meta, item.text, item.area].filter(Boolean).join(" "),
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
      href: a.href,
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
  for (const t of getTravelTopics()) {
    out.push({
      id: `travel-info:${t.slug}`,
      group: "מידע למטייל",
      name: t.h1,
      meta: t.title,
      href: `/travel-info/${t.slug}/`,
      text: [t.title, t.h1, t.answer].join(" "),
    });
  }
  return out;
}
