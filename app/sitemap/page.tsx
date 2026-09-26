import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getAllCollections,
  getAreas,
  getAttractionsPage,
  getCollection,
  getEditorialPages,
  getSite,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Sitemap for people (design 15c), generated from the content so every page
// added in the admin appears here automatically.

export function generateMetadata() {
  return pageMetadata({
    path: "/sitemap/",
    fallbackTitle: "מפת האתר",
    fallbackDescription: "כל העמודים ב‑Baku40 במקום אחד: אוספים, מלונות, אזורים, אטרקציות, מדריכים ועמודי מידע.",
  });
}

type Group = { title: string; links: { label: string; href: string }[] };

export default function SitemapPage() {
  const site = getSite();
  const editorial = getEditorialPages();
  const by = (prefixes: string[]) =>
    editorial.filter((p) => prefixes.some((x) => p.url.startsWith(x))).map((p) => ({ label: p.h1, href: p.url }));
  const attractions = getAttractionsPage();

  const groups: Group[] = [
    {
      title: "אוספים",
      links: [{ label: attractions.h1, href: attractions.url }, ...getAllCollections().map((c) => ({ label: c.h1, href: c.url }))],
    },
    { title: "מדריכים ומידע למטייל", links: by(["/baku/", "/travel-info/", "/weather/", "/flights/", "/airport/", "/itineraries/", "/destinations/"]) },
    { title: "אטרקציות", links: attractions.items.map((a) => ({ label: a.name, href: a.href })) },
    { title: "אזורי העיר", links: [{ label: "כל האזורים", href: "/areas/" }, ...getAreas().map((a) => ({ label: a.name, href: a.url }))] },
    {
      title: "מלונות",
      links: getCollection("hotels").items.filter((h) => h.url).map((h) => ({ label: h.name, href: h.url! })),
    },
    { title: "מגזין ונושאים", links: [{ label: "מגזין", href: "/magazine/" }, ...by(["/magazine/", "/topics/"])] },
    { title: "השקעות ונדל״ן", links: by(["/invest/", "/real-estate/", "/casino/"]) },
    { title: "על האתר", links: [...by(["/about/", "/contact/", "/affiliate-disclosure/"]), { label: "קרדיטים לתמונות", href: "/credits/" }] },
  ];

  return (
    <div className="container listing-head">
      <Breadcrumbs crumbs={[{ label: "דף הבית", href: "/" }, { label: "מפת האתר", href: "/sitemap/" }]} />
      <h1 className="listing-h1">מפת האתר</h1>
      <p className="listing-intro">כל העמודים ב‑{site.name}, לפי נושא.</p>
      <div className="sitemap-grid">
        {groups
          .filter((g) => g.links.length)
          .map((g) => (
            <nav key={g.title} aria-label={g.title} className="sitemap-group">
              <h2>{g.title}</h2>
              <ul>
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
      </div>
      <div className="related" />
    </div>
  );
}
