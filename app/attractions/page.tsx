import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ListingClient } from "@/components/listing/ListingClient";
import type { CardData } from "@/components/listing/types";
import { absoluteUrl, getAttractionsCatalog, getAttractionsPage, getPhoto } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata, parseCrumbs } from "@/lib/seo";

// Attractions listing — design/Baku40 Listing and Details.dc.html (2a).
// Texts: content/pages/attractions.json; full catalog: content/attractions.json.

export function generateMetadata() {
  const page = getAttractionsPage();
  return pageMetadata({ path: page.url, fallbackTitle: page.h1, fallbackDescription: page.intro });
}

export default function AttractionsPage() {
  const page = getAttractionsPage();
  const catalog = getAttractionsCatalog();
  const crumbs = parseCrumbs(page.crumbs, page.url);

  const cards: CardData[] = page.items.map((a) => ({
    id: `attractions:${a.id}`,
    name: a.name,
    meta: `${a.area} · ${a.dur}`,
    text: a.note,
    foot: a.tags.join(" · "),
    icon: "schedule",
    cta: "",
    badge: a.badge,
    href: a.href,
    photo: getPhoto(a.photo, "", a.photoAlt),
    verify: "",
    verifyKind: "none",
    facets: [a.area, a.dur, ...a.tags, a.badge === "חובה" ? "פעם ראשונה" : ""].filter(Boolean),
    searchText: [a.name, a.area, a.note, ...a.tags].join(" ").toLowerCase(),
  }));

  const url = absoluteUrl(page.url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": url, url, name: page.h1, inLanguage: "he" },
      breadcrumbJsonLd(crumbs),
      {
        "@type": "ItemList",
        numberOfItems: page.items.length,
        itemListElement: page.items.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.name })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container listing-head">
        <Breadcrumbs crumbs={crumbs} />
        <div className="attr-head">
          <div>
            <h1 className="listing-h1">{page.h1}</h1>
            <p className="listing-intro">{page.intro}</p>
          </div>
          <Link href={page.featured.href} className="attr-featured">
            <span className="kicker">{page.featured.kicker}</span>
            <strong>{page.featured.title}</strong>
            <span>{page.featured.text}</span>
          </Link>
        </div>
        <ListingClient
          cards={cards}
          groups={page.filterGroups}
          searchPlaceholder={page.searchPlaceholder}
          sort={page.sort}
          countText={page.count.replace(/^\d+/, String(page.items.length))}
        />
      </div>

      <section className="container editorial" aria-labelledby="editorial-heading">
        <div className="editorial__card">
          <h2 id="editorial-heading">{page.editorialHeading}</h2>
          {page.editorialParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <aside className="info-box">
            <h3 className="info-box__title">{page.box.title}</h3>
            <p className="info-box__text">{page.box.text}</p>
          </aside>
        </div>
      </section>

      <section className="container editorial" aria-labelledby="faq-heading">
        <div className="editorial__card">
          <h2 id="faq-heading">{page.faqTitle}</h2>
          <div className="faq">
            {page.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container editorial related" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="section-title section-title--md">
          {page.catalog.title}
        </h2>
        <p className="section-text">{page.catalog.text}</p>
        <div className="catalog">
          {Object.entries(page.catalog.groups).map(([key, title]) => {
            const entries = catalog.groups[key];
            if (!entries?.length) return null;
            return (
              <details key={key} className="catalog__group">
                <summary>
                  {title} <span className="tab__count">{entries.length}</span>
                </summary>
                <ul>
                  {entries.map((e) => (
                    <li key={e.name}>
                      <strong>{e.name}</strong>
                      {e.nameEn && <span lang="en"> · {e.nameEn}</span>}
                      {(e.est || e.note) && (
                        <span className="catalog__meta">{[e.est, e.note ?? e.type].filter(Boolean).join(" · ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
        <p className="catalog__source">
          מקור: {catalog.meta.source} · {catalog.meta.license.split("—")[0].trim()} · נאסף ב‑{catalog.meta.retrieved}
        </p>
      </section>
    </>
  );
}
