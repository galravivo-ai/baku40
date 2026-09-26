import "server-only";
import type { Metadata } from "next";
import { getSite } from "./content";
import type { EditorialPage } from "./schema";
import { MIN_INDEXABLE_WORDS, pageMetadata, type Crumb } from "./seo";

// Parent pages for breadcrumbs, by URL prefix.
const PARENTS: [string, Crumb][] = [
  ["/real-estate/projects/", { label: "השקעות נדל״ן בבאקו", href: "/real-estate/baku/" }],
  ["/invest/", { label: "השקעות", href: "/invest/baku/" }],
  ["/magazine/", { label: "מגזין", href: "/magazine/" }],
  ["/weather/", { label: "מידע למטייל", href: "/travel-info/" }],
  ["/flights/", { label: "מידע למטייל", href: "/travel-info/" }],
  ["/airport/", { label: "מידע למטייל", href: "/travel-info/" }],
  ["/destinations/", { label: "טיולי יום", href: "/day-trips/" }],
  ["/itineraries/", { label: "מסלולים", href: "/itineraries/" }],
];

export function editorialCrumbs(page: EditorialPage): Crumb[] {
  const parent = PARENTS.find(([prefix, c]) => page.url.startsWith(prefix) && c.href !== page.url)?.[1];
  return [{ label: "דף הבית", href: "/" }, ...(parent ? [parent] : []), { label: page.h1, href: page.url }];
}

export function editorialWordCount(page: EditorialPage): number {
  const texts: string[] = [page.intro];
  for (const b of page.blocks) {
    if ("text" in b) texts.push(b.text);
    if (b.type === "callout") texts.push(b.title);
    if (b.type === "list") texts.push(...b.items);
    if (b.type === "cards") texts.push(...b.items.map((c) => `${c.title} ${c.text}`));
    if (b.type === "faq") texts.push(...b.items.map((f) => `${f.q} ${f.a}`));
    if (b.type === "table") texts.push(...b.rows.flat());
  }
  return texts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function editorialMetadata(page: EditorialPage): Metadata {
  const staticPage = getSite().staticPages.find((p) => p.url === page.url);
  const thin = editorialWordCount(page) < MIN_INDEXABLE_WORDS;
  const robots = staticPage?.robots ?? page.seo.robots;
  return pageMetadata({
    path: page.url,
    title: page.seo.metaTitle ?? staticPage?.metaTitle,
    fallbackTitle: page.h1,
    description: page.seo.metaDescription ?? staticPage?.metaDescription,
    fallbackDescription: page.intro || page.h1,
    robots: thin ? "noindex,follow" : robots,
  });
}
