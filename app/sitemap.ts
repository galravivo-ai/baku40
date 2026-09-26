import type { MetadataRoute } from "next";
import { absoluteUrl, getAllCollections, getAreas, getAttractionsPage, getCollection } from "@/lib/content";
import { areaWordCount, itemWordCount, MIN_INDEXABLE_WORDS } from "@/lib/seo";

// Only indexable pages: noindex pages (thin content, SEO spec §8) stay out.
// The split per type and the image sitemap come with stage 5 (SEO spec §6).
export default function sitemap(): MetadataRoute.Sitemap {
  const collections = getAllCollections()
    .filter((c) => !c.seo.robots.includes("noindex"))
    .map((c) => c.seo.canonical || c.url);
  const hotels = getCollection("hotels")
    .items.filter((h) => h.url && !h.seo.noindex && itemWordCount(h) >= MIN_INDEXABLE_WORDS)
    .map((h) => h.url!);
  const areas = getAreas()
    .filter((a) => areaWordCount(a) >= MIN_INDEXABLE_WORDS)
    .map((a) => a.url);
  return ["/", getAttractionsPage().url, ...collections, ...hotels, ...areas].map((path) => ({
    url: absoluteUrl(path),
  }));
}
