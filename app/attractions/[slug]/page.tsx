import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { EditorialView } from "@/components/editorial/EditorialView";
import { absoluteUrl, getAreas, getAttractionsPage, getEditorialPage } from "@/lib/content";
import { editorialMetadata } from "@/lib/editorial";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

// Attraction page (design 2c). When content/pages/editorial has a full page
// for the URL (e.g. the Heydar Aliyev Center) it is used; otherwise the page
// is built from the listing record in content/pages/attractions.json.

export const dynamicParams = false;

export function generateStaticParams() {
  return getAttractionsPage()
    .items.filter((a) => a.href === `/attractions/${a.slug}/`)
    .map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function load(params: Props["params"]) {
  const { slug } = await params;
  const item = getAttractionsPage().items.find((a) => a.slug === slug);
  if (!item) notFound();
  return { item, full: getEditorialPage(item.href) };
}

export async function generateMetadata({ params }: Props) {
  const { item, full } = await load(params);
  if (full) return editorialMetadata(full);
  // A short record: noindex until it has a full page (SEO spec §8).
  return pageMetadata({ path: item.href, fallbackTitle: item.name, fallbackDescription: item.note, robots: "noindex,follow" });
}

export default async function AttractionPage({ params }: Props) {
  const { item, full } = await load(params);
  if (full) return <EditorialView page={full} />;

  const page = getAttractionsPage();
  const area = getAreas().find((a) => a.slug === item.areaSlug);
  const crumbs = [
    { label: "דף הבית", href: "/" },
    { label: page.h1, href: page.url },
    { label: item.name, href: item.href },
  ];
  const similar = page.items.filter((a) => a.id !== item.id && a.tags.some((t) => item.tags.includes(t))).slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "TouristAttraction", name: item.name, url: absoluteUrl(item.href), description: item.note },
            breadcrumbJsonLd(crumbs),
          ],
        }}
      />
      {item.photo && (
        <div className="ed-gallery ed-gallery--single">
          <div className="ed-gallery__main">
            <Photo photo={item.photo} alt={item.photoAlt} sizes="100vw" priority />
          </div>
        </div>
      )}
      <div className="container detail-layout">
        <div>
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="ed-h1">{item.name}</h1>
          <p className="ed-intro">{item.note}</p>
          <dl className="ed-facts">
            <div>
              <dt>אזור</dt>
              <dd>{area ? <Link href={area.url}>{item.area}</Link> : item.area}</dd>
            </div>
            <div>
              <dt>משך ביקור</dt>
              <dd>{item.dur}</dd>
            </div>
            {item.tags.length > 0 && (
              <div>
                <dt>מתאים ל</dt>
                <dd>{item.tags.join(" · ")}</dd>
              </div>
            )}
          </dl>
          <aside className="info-box ed-block">
            <h2 className="info-box__title">{page.box.title}</h2>
            <p className="info-box__text">{page.box.text}</p>
          </aside>
        </div>
        <aside className="detail-side">
          <div className="side-card">
            <SaveButton id={`attractions:${item.id}`} name={item.name} />
          </div>
          {similar.length > 0 && (
            <nav className="side-links" aria-label="אטרקציות דומות">
              <div className="kicker">אטרקציות דומות</div>
              {similar.map((a) => (
                <Link key={a.id} href={a.href}>
                  <Icon name="castle" />
                  {a.name}
                </Link>
              ))}
            </nav>
          )}
        </aside>
      </div>
    </>
  );
}
