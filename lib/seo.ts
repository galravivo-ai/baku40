import "server-only";
import type { Metadata } from "next";
import { absoluteUrl, getAllCollections, getPhoto, getSite, type PhotoInfo } from "./content";
import type { Area, Collection, Item } from "./schema";

/** Vercel preview deployments are never indexed (SEO spec §1). */
export function isProductionIndexable() {
  const env = process.env.VERCEL_ENV;
  return !env || env === "production";
}

function parseRobots(robots: string | undefined) {
  const value = (robots ?? "index,follow").toLowerCase();
  const index = isProductionIndexable() && !value.includes("noindex");
  const follow = !value.includes("nofollow");
  return { index, follow };
}

type PageSeo = {
  path: string;
  title?: string | null;
  fallbackTitle: string;
  description?: string | null;
  fallbackDescription: string;
  robots?: string;
  ogImage?: PhotoInfo;
  ogImageAlt?: string;
};

export function pageMetadata(p: PageSeo): Metadata {
  const site = getSite();
  const url = absoluteUrl(p.path);
  // metaTitle is stored complete (with the brand); otherwise h1 goes through the template.
  const title = p.title ? { absolute: p.title } : p.fallbackTitle;
  const description = p.description || shorten(p.fallbackDescription, 155);
  const ogTitle = p.title ?? site.titleTemplate.replace("%s", p.fallbackTitle);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { he: url, "x-default": url } },
    robots: parseRobots(p.robots),
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      url,
      title: ogTitle,
      description,
      images: p.ogImage ? [{ url: absoluteUrl(p.ogImage.src), alt: p.ogImageAlt ?? p.ogImage.alt }] : undefined,
    },
    twitter: {
      card: site.twitterCard as "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export function collectionMetadata(c: Collection): Metadata {
  return pageMetadata({
    path: c.seo.canonical || c.url,
    title: c.seo.metaTitle,
    fallbackTitle: c.h1,
    description: c.seo.metaDescription,
    fallbackDescription: c.intro,
    robots: c.seo.robots,
    ogImage: c.seo.ogImage ? getPhoto(c.seo.ogImage, "", c.seo.ogImageAlt) : null,
    ogImageAlt: c.seo.ogImageAlt,
  });
}

export function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumbs from the `crumbs` text ("דף הבית ← אוכל ← מסעדות"). Labels are
 * linked when they match the home page, a nav item or a collection; the last
 * one is the current page.
 */
export function parseCrumbs(crumbs: string, currentPath: string): Crumb[] {
  const site = getSite();
  const labels = crumbs.split("←").map((s) => s.trim()).filter(Boolean);
  const known = new Map<string, string>();
  known.set("דף הבית", "/");
  for (const n of site.nav) {
    known.set(n.label, n.href);
    for (const l of n.links ?? []) known.set(l.label, l.href);
  }
  const collections = getAllCollections();
  return labels.map((label, i) => {
    if (i === labels.length - 1) return { label, href: currentPath };
    const direct = known.get(label);
    const byCollection = collections.find((c) => c.h1 === label || c.h1.startsWith(label + " "))?.url;
    const href = direct ?? byCollection;
    return { label, href: href && href !== currentPath ? href : undefined };
  });
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  const linked = crumbs.filter((c) => c.href);
  return {
    "@type": "BreadcrumbList",
    itemListElement: linked.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href!),
    })),
  };
}

export function collectionJsonLd(c: Collection, crumbs: Crumb[]) {
  const url = absoluteUrl(c.seo.canonical || c.url);
  const graph: Record<string, unknown>[] = [];
  if (c.seo.schema.includes("CollectionPage")) {
    graph.push({
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: c.h1,
      description: c.seo.metaDescription,
      inLanguage: "he",
      isPartOf: { "@type": "WebSite", name: getSite().name, url: absoluteUrl("/") },
    });
  }
  if (c.seo.schema.includes("BreadcrumbList")) graph.push(breadcrumbJsonLd(crumbs));
  if (c.seo.schema.includes("ItemList")) {
    // Only name and (when it exists) the record's own page: no ratings, prices
    // or other fields that are not shown as structured facts (SEO spec §3).
    graph.push({
      "@type": "ItemList",
      numberOfItems: c.items.length,
      itemListElement: c.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.url ? { url: absoluteUrl(item.url) } : {}),
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Words of unique text a record's own page shows (SEO spec §8: <150 ⇒ noindex). */
export function itemWordCount(item: Item): number {
  const parts = [
    item.text,
    ...(item.pitch ?? []),
    item.bottomLine ?? "",
    ...(item.pros ?? []),
    ...(item.cons ?? []),
    item.roomsIntro ?? "",
    ...(item.rooms ?? []).map((r) => `${r.name} ${r.text}`),
    ...(item.checklist ?? []),
  ];
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export const MIN_INDEXABLE_WORDS = 150;

export function areaWordCount(area: Area): number {
  const text = [
    ...(area.fits?.paragraphs ?? []),
    ...(area.howTo?.paragraphs ?? []),
    area.howTo?.tip?.text ?? "",
    ...(area.pros ?? []),
    ...(area.cons ?? []),
    area.gettingThere?.text ?? "",
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}
