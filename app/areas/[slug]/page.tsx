import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { AreaTabs, type AreaTab } from "@/components/area/AreaTabs";
import { absoluteUrl, getAreas, getCollection } from "@/lib/content";
import { areaWordCount, breadcrumbJsonLd, MIN_INDEXABLE_WORDS, pageMetadata, type Crumb } from "@/lib/seo";

// Area page — design/Baku40 Editorial Templates.dc.html (3b). Long-form text
// comes from content/areas.json; the lists come from the collections.

export const dynamicParams = false;

export function generateStaticParams() {
  return getAreas().map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function load(slug: string) {
  const area = getAreas().find((a) => a.slug === slug);
  if (!area) notFound();
  return area;
}

export async function generateMetadata({ params }: Props) {
  const area = load((await params).slug);
  return pageMetadata({
    path: area.url,
    fallbackTitle: `${area.name}: איפה לישון, לאכול ומה לראות`,
    fallbackDescription: area.subtitle ?? area.fits?.paragraphs[0] ?? `${area.name} בבאקו: מלונות, מסעדות וקניות באזור.`,
    // SEO spec §8: under 150 words of unique text ⇒ noindex until completed.
    robots: areaWordCount(area) < MIN_INDEXABLE_WORDS ? "noindex,follow" : "index,follow",
  });
}

export default async function AreaPage({ params }: Props) {
  const area = load((await params).slug);
  const crumbs: Crumb[] = [
    { label: "דף הבית", href: "/" },
    { label: "אזורי העיר" },
    { label: area.name, href: area.url },
  ];

  const hotels = getCollection("hotels").items.filter((h) => h.areaSlug === area.slug);
  const restaurants = getCollection("restaurants").items.filter((r) => r.areaSlug === area.slug);
  const shopping = getCollection("shopping").items.filter((s) => s.areaSlug === area.slug);

  const tabs: AreaTab[] = [];
  const editorial = (name: string) => area.whatsHere?.find((w) => w.tab === name);
  const fromEditorial = (name: string) => {
    const block = editorial(name);
    if (!block) return;
    tabs.push({
      label: block.tab,
      items: block.items.map((i) => ({
        name: i.name,
        meta: i.meta,
        photo: <Photo photo={i.photo} alt={i.photoAlt} sizes="96px" showTags={false} />,
      })),
    });
  };
  fromEditorial("אטרקציות");
  if (hotels.length) {
    tabs.push({
      label: "מלונות",
      items: hotels.map((h) => ({
        name: h.name,
        meta: h.meta,
        href: h.url ?? undefined,
        photo: <Photo photo={h.photo} alt={h.photoAlt} note={h.photoNote} sizes="96px" showTags={false} />,
      })),
    });
  }
  if (restaurants.length) {
    tabs.push({
      label: "מסעדות",
      items: restaurants.map((r) => ({
        name: r.name,
        meta: r.meta,
        href: `/restaurants/?q=${encodeURIComponent(r.name)}`,
        photo: <Photo photo={r.photo} alt={r.photoAlt} note={r.photoNote} sizes="96px" showTags={false} />,
      })),
    });
  }
  if (shopping.length) {
    tabs.push({
      label: "קניות",
      items: shopping.map((s) => ({
        name: s.name,
        meta: s.meta,
        photo: <Photo photo={s.photo} alt={s.photoAlt} note={s.photoNote} sizes="96px" showTags={false} />,
      })),
    });
  } else {
    fromEditorial("קניות");
  }

  const placeLd = {
    "@type": "Place",
    name: area.name,
    url: absoluteUrl(area.url),
    containedInPlace: { "@type": "City", name: "Baku" },
  };

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [placeLd, breadcrumbJsonLd(crumbs)] }} />

      <div className="hero hero--area">
        {area.heroPhoto && <Photo photo={area.heroPhoto} alt={area.heroPhotoAlt ?? ""} sizes="100vw" priority />}
        <div className="hero__shade" />
        <div className="hero__body">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="hero__h1">{area.name}</h1>
          {area.subtitle && <p className="hero__intro">{area.subtitle}</p>}
        </div>
      </div>

      <div className="container detail-layout">
        <div className="area-main">
          {area.fits && (
            <section className="detail-card">
              <h2>{area.fits.title}</h2>
              {area.fits.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {area.bestFor && (
                <ul className="best-for">
                  {area.bestFor.map((b) => (
                    <li key={b.label}>
                      <Icon name={b.icon} />
                      {b.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="detail-card">
            {area.howTo && (
              <>
                <h2>{area.howTo.title}</h2>
                {area.howTo.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {area.howTo.tip && (
                  <aside className="tip-box">
                    <h3>{area.howTo.tip.title}</h3>
                    <p>{area.howTo.tip.text}</p>
                  </aside>
                )}
              </>
            )}
            <h2>מה יש באזור</h2>
            {tabs.length ? (
              <AreaTabs tabs={tabs} />
            ) : (
              <p>עדיין אין רשומות משויכות לאזור הזה.</p>
            )}
          </section>

          {(area.pros?.length || area.cons?.length) && (
            <section className="pros-cons pros-cons--cards">
              {area.pros?.length ? (
                <div className="detail-card">
                  <h3 className="pc-head pc-head--pro">
                    <Icon name="check_circle" />
                    יתרונות
                  </h3>
                  <ul>
                    {area.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {area.cons?.length ? (
                <div className="detail-card">
                  <h3 className="pc-head pc-head--con">
                    <Icon name="error" />
                    שיקולים
                  </h3>
                  <ul>
                    {area.cons.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )}

          {area.gettingThere && (
            <section className="detail-card">
              <h2>{area.gettingThere.title}</h2>
              <p>{area.gettingThere.text}</p>
            </section>
          )}
        </div>

        <aside className="detail-side">
          <div className="side-card">
            {area.levels?.length ? (
              <>
                <div className="kicker">מדדי אזור</div>
                <dl className="levels">
                  {area.levels.map((l) => (
                    <div key={l.label}>
                      <dt>{l.label}</dt>
                      <dd>
                        <span className="level-bar" style={{ ["--pct" as string]: `${l.pct}%` }} />
                        <span className="visually-hidden">{l.pct}%</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
            {hotels.length > 0 && (
              <a className="btn btn--primary" href={`/hotels/?q=${encodeURIComponent(hotels[0].area ?? area.name)}`}>
                מלונות ב{area.name}
              </a>
            )}
            <Link className="btn btn--outline" href="/hotels/">
              כל המלונות בבאקו
            </Link>
          </div>

          {area.itineraries?.length ? (
            <nav className="side-dark" aria-label="מסלולים שעוברים כאן">
              <div className="kicker kicker--on-dark">מסלולים שעוברים כאן</div>
              {area.itineraries.map((i) => (
                <Link key={i.title} href="/itineraries/">
                  <strong>{i.title}</strong>
                  <span>{i.meta}</span>
                </Link>
              ))}
            </nav>
          ) : null}

          <nav className="side-links" aria-label="אזורים נוספים">
            <div className="kicker">אזורים נוספים</div>
            {getAreas()
              .filter((a) => a.slug !== area.slug)
              .map((a) => (
                <Link key={a.slug} href={a.url}>
                  <Icon name="location_city" />
                  {a.name}
                </Link>
              ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
