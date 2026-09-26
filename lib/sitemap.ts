import "server-only";
import {
  absoluteUrl,
  getAllCollections,
  getAreas,
  getAttractionsPage,
  getCollection,
  getEditorialPages,
  getLicensedPhoto,
} from "./content";
import { editorialMetadata, isoDate, pageDates } from "./editorial";
import { areaWordCount, itemWordCount, MIN_INDEXABLE_WORDS } from "./seo";

// XML sitemaps split by type (SEO spec §6). Only indexable pages, and only
// licensed images in the image sitemap.

type Entry = { path: string; lastmod?: string; images?: string[] };

const latest = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().at(-1);
const verifyDate = (verify: string) => isoDate(verify);

function indexable(robots: unknown) {
  if (!robots || typeof robots !== "object") return true;
  return (robots as { index?: boolean }).index !== false;
}

export const SITEMAPS = {
  pages(): Entry[] {
    const attractions = getAttractionsPage();
    const entries: Entry[] = [
      { path: "/" },
      {
        path: attractions.url,
        images: attractions.items
          .map((a) => getLicensedPhoto(a.photo, "", a.photoAlt))
          .flatMap((p) => (p ? [p.src] : [])),
      },
      { path: "/magazine/" },
    ];
    for (const page of getEditorialPages()) {
      if (!indexable(editorialMetadata(page).robots)) continue;
      const photos = [
        ...page.images.map((i) => i.photo),
        ...page.blocks.flatMap((b) => (b.type === "image" ? [b.photo] : b.type === "photoCards" ? b.items.map((c) => c.photo) : [])),
      ];
      entries.push({
        path: page.url,
        lastmod: pageDates(page).modified,
        images: photos.map((p) => getLicensedPhoto(p, "", "")).flatMap((p) => (p ? [p.src] : [])),
      });
    }
    return entries;
  },
  collections(): Entry[] {
    return getAllCollections()
      .filter((c) => !c.seo.robots.includes("noindex"))
      .map((c) => ({
        path: c.seo.canonical || c.url,
        lastmod: latest(c.items.map((i) => verifyDate(i.verify))),
        images: c.items
          .map((i) => getLicensedPhoto(i.photo, i.photoNote, i.photoAlt, i.photoLicense))
          .flatMap((p) => (p ? [p.src] : [])),
      }));
  },
  hotels(): Entry[] {
    return getCollection("hotels")
      .items.filter((h) => h.url && !h.seo.noindex && itemWordCount(h) >= MIN_INDEXABLE_WORDS)
      .map((h) => ({ path: h.url!, lastmod: verifyDate(h.verify) }));
  },
  areas(): Entry[] {
    return getAreas()
      .filter((a) => areaWordCount(a) >= MIN_INDEXABLE_WORDS)
      .map((a) => ({ path: a.url }));
  },
};

export type SitemapName = keyof typeof SITEMAPS;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function urlsetXml(entries: Entry[]): string {
  const urls = entries
    .map((e) => {
      const images = [...new Set(e.images ?? [])]
        .map((src) => `<image:image><image:loc>${esc(absoluteUrl(src))}</image:loc></image:image>`)
        .join("");
      return `<url><loc>${esc(absoluteUrl(e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${images}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

export function indexXml(): string {
  const items = (Object.keys(SITEMAPS) as SitemapName[])
    .map((name) => {
      const lastmod = latest(SITEMAPS[name]().map((e) => e.lastmod));
      return `<sitemap><loc>${esc(absoluteUrl(`/sitemaps/${name}.xml`))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}
