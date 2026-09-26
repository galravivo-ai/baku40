import type { MetadataRoute } from "next";
import { absoluteUrl, getAllCollections } from "@/lib/content";

// Stage 1–2 sitemap: home and the collection pages. The split per type,
// lastmod per record and the image sitemap come with stage 5 (SEO spec §6).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllCollections()
    .filter((c) => !c.seo.robots.includes("noindex"))
    .map((c) => c.seo.canonical || c.url);
  return ["/", ...pages].map((path) => ({ url: absoluteUrl(path) }));
}
