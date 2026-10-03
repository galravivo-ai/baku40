import { FaqSection } from "@/components/FaqSection";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { absoluteUrl, getAreas, getAreasHub, getAttractionsPage, getCollection } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

// Areas hub: Baku by neighbourhood, built from the content by areaSlug —
// the site's way in by place (instead of a map that would need coordinates).

export function generateMetadata() {
  const hub = getAreasHub();
  return pageMetadata({
    path: "/areas/",
    title: hub.metaTitle,
    fallbackTitle: hub.h1,
    description: hub.metaDescription,
    fallbackDescription: hub.intro,
  });
}

export default function AreasHub() {
  const hub = getAreasHub();
  const hotels = getCollection("hotels").items;
  const restaurants = getCollection("restaurants").items;
  const shopping = getCollection("shopping").items;
  const attractions = getAttractionsPage().items;
  const crumbs = [
    { label: "דף הבית", href: "/" },
    { label: "אזורי העיר", href: "/areas/" },
  ];

  const areas = getAreas().map((a) => {
    const inArea = <T extends { areaSlug?: string | null }>(list: T[]) => list.filter((x) => x.areaSlug === a.slug);
    const h = inArea(hotels);
    const r = inArea(restaurants);
    const s = inArea(shopping);
    const at = inArea(attractions);
    const photo =
      a.heroPhoto ??
      at.find((x) => x.photo)?.photo ??
      r.find((x) => x.photo)?.photo ??
      "";
    const counts = [
      at.length && `${at.length} אטרקציות`,
      h.length && `${h.length} מלונות`,
      r.length && `${r.length} מסעדות`,
      s.length && `${s.length} מקומות קניות`,
    ].filter(Boolean) as string[];
    return { area: a, photo, counts, highlights: [...at.map((x) => x.name), ...h.map((x) => x.name)].slice(0, 3) };
  });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ItemList",
              name: hub.h1,
              itemListElement: areas.map((x, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: x.area.name,
                url: absoluteUrl(x.area.url),
              })),
            },
            breadcrumbJsonLd(crumbs),
          ],
        }}
      />
      <div className="container listing-head">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="listing-h1">{hub.h1}</h1>
        <p className="listing-intro">{hub.intro}</p>
        <div className="card-grid">
          {areas.map(({ area, photo, counts, highlights }) => (
            <article key={area.slug} className="card">
              <div className="card__media">
                <Photo photo={photo} alt={area.heroPhotoAlt ?? area.name} sizes="(max-width: 700px) 100vw, 430px" icon="location_city" />
              </div>
              <div className="card__body">
                {counts.length > 0 && <div className="card__meta">{counts.join(" · ")}</div>}
                <h2 className="card__name">
                  <Link href={area.url}>{area.name}</Link>
                </h2>
                {area.subtitle && <p className="card__text">{area.subtitle}</p>}
                {highlights.length > 0 && <p className="card__disclosure">בין היתר: {highlights.join(", ")}</p>}
                <div className="card__fill" />
                <div className="card__foot">
                  <span className="card__foot-label">לעמוד האזור</span>
                  <span className="card__cta">←</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <FaqSection items={hub.faq} title="שאלות נפוצות על אזורי באקו" url="/areas/" />
      </div>
      <div className="related" />
    </>
  );
}
