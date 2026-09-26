import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { SaveButton } from "@/components/SaveButton";
import { VerifyBadge } from "@/components/listing/VerifyBadge";
import { bookingHref } from "@/lib/booking";
import {
  absoluteUrl,
  areaFor,
  getCollection,
  getItem,
  getPhoto,
  getSite,
  verifyKind,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  itemWordCount,
  MIN_INDEXABLE_WORDS,
  pageMetadata,
  parseCrumbs,
  shorten,
} from "@/lib/seo";

// Hotel page — design/Baku40 Listing and Details.dc.html (2f).

export const dynamicParams = false;

export function generateStaticParams() {
  return getCollection("hotels").items.filter((h) => h.url).map((h) => ({ slug: h.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function load(slug: string) {
  const item = getItem("hotels", slug);
  if (!item?.url) notFound();
  return item;
}

export async function generateMetadata({ params }: Props) {
  const item = load((await params).slug);
  const thin = itemWordCount(item) < MIN_INDEXABLE_WORDS;
  return pageMetadata({
    path: item.url!,
    title: item.seo.metaTitle,
    fallbackTitle: item.name,
    description: item.seo.metaDescription,
    fallbackDescription: item.text,
    // SEO spec §8: pages with under 150 words of unique text stay noindex.
    robots: item.seo.noindex || thin ? "noindex,follow" : "index,follow",
    ogImage: getPhoto(item.photo, item.photoNote, item.photoAlt),
  });
}

export default async function HotelPage({ params }: Props) {
  const item = load((await params).slug);
  const site = getSite();
  const hotels = getCollection("hotels");
  const area = areaFor(item);
  const crumbs = parseCrumbs(`${hotels.crumbs} ← ${item.name}`, item.url!);
  const stars = item.stars ? "★".repeat(item.stars) : "";
  const booking = bookingHref(item);
  const photo = getPhoto(item.photo, item.photoNote, item.photoAlt);

  const nearbyHotels = hotels.items
    .filter((h) => h.slug !== item.slug && h.url && h.areaSlug && h.areaSlug === item.areaSlug)
    .slice(0, 3);
  const nearbyRestaurants = item.areaSlug
    ? getCollection("restaurants").items.filter((r) => r.areaSlug === item.areaSlug).slice(0, 3)
    : [];

  const hotelLd = {
    "@type": "Hotel",
    name: item.name,
    url: absoluteUrl(item.url!),
    description: item.seo.metaDescription ?? shorten(item.text, 155),
    address: { "@type": "PostalAddress", addressLocality: "Baku", addressCountry: "AZ" },
    // Only licensed images go into structured data (SEO spec §3–4).
    ...(photo && !photo.credit ? { image: absoluteUrl(photo.src) } : {}),
    ...(item.stars ? { starRating: { "@type": "Rating", ratingValue: item.stars } } : {}),
  };

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [hotelLd, breadcrumbJsonLd(crumbs)] }} />

      {/* Booking photos are 240px thumbnails: shown small beside the title,
          never stretched into the wide gallery. */}
      {photo && !photo.credit && (
        <div className="hotel-gallery">
          <Photo photo={item.photo} alt={item.photoAlt} note={item.photoNote} sizes="100vw" priority />
        </div>
      )}

      <div className="container detail-layout">
        <div>
          <Breadcrumbs crumbs={crumbs} />
          <div className="detail-title">
            {photo?.credit && (
              <figure className="detail-thumb">
                <Image src={photo.src} alt={photo.alt} width={120} height={120} priority />
                <figcaption>צילום: {photo.credit}</figcaption>
              </figure>
            )}
            <h1>{item.name}</h1>
            {stars && (
              <span className="detail-title__stars" aria-label={`${item.stars} כוכבים`}>
                {stars}
              </span>
            )}
          </div>
          <div className="detail-sub">
            {item.meta}
            {area && (
              <>
                {" · "}
                <Link href={area.url}>{area.name}</Link>
              </>
            )}
          </div>

          <article className="detail-card">
            <h2>למי המלון מתאים</h2>
            <p>{item.text}</p>
            {item.pitch?.map((p) => <p key={p}>{p}</p>)}
            <VerifyBadge kind={verifyKind(item.verify)} text={item.verify} />

            {item.bottomLine && (
              <aside className="info-box detail-card__box">
                <h3 className="info-box__title">בשורה התחתונה</h3>
                <p className="info-box__text">{item.bottomLine}</p>
              </aside>
            )}

            {item.distances?.length ? (
              <>
                <h2>יתרון המיקום</h2>
                <div className="distance-grid">
                  {item.distances.map((d) => (
                    <div key={d.label} className="distance">
                      <strong>{d.value}</strong>
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {item.facilities?.length ? (
              <>
                <h2>מתקנים שמשנים החלטה</h2>
                <ul className="tag-list tag-list--lg">
                  {item.facilities.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {item.pros?.length || item.cons?.length ? (
              <div className="pros-cons">
                {item.pros?.length ? (
                  <div>
                    <h3>יתרונות</h3>
                    <ul className="pros">
                      {item.pros.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.cons?.length ? (
                  <div>
                    <h3>שיקולים</h3>
                    <ul className="cons">
                      {item.cons.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {item.rooms?.length ? (
              <>
                <h2>החדרים</h2>
                {item.roomsIntro && <p>{item.roomsIntro}</p>}
                <div className="rooms">
                  {item.rooms.map((r) => (
                    <div key={r.name} className="room">
                      <div className="room__head">
                        <strong>{r.name}</strong>
                        {r.size && <span>{r.size}</span>}
                      </div>
                      <p>{r.text}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {item.checklist?.length ? (
              <>
                <h2>מה לבדוק לפני שמזמינים</h2>
                <ul className="checklist">
                  {item.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="disclosure-box">
              <b>גילוי נאות:</b> {site.affiliateDisclosure}
            </p>
          </article>
        </div>

        <aside className="detail-side">
          <div className="side-card">
            <div className="kicker">מידע מהיר</div>
            <dl className="facts">
              {item.stars ? (
                <div>
                  <dt>דירוג</dt>
                  <dd>{item.stars} כוכבים</dd>
                </div>
              ) : null}
              {item.area && (
                <div>
                  <dt>אזור</dt>
                  <dd>{area ? <Link href={area.url}>{item.area}</Link> : item.area}</dd>
                </div>
              )}
              {item.foot && (
                <div>
                  <dt>מתאים ל</dt>
                  <dd>{item.foot}</dd>
                </div>
              )}
            </dl>
            <a className="btn btn--primary" href={booking} target="_blank" rel="sponsored nofollow noopener">
              {item.cta}
            </a>
            <p className="side-card__note">{site.affiliateDisclosureShort}</p>
            <div className="side-card__row">
              {item.officialUrl && (
                <a className="btn btn--outline" href={item.officialUrl} target="_blank" rel="noopener">
                  אתר רשמי
                </a>
              )}
              <SaveButton id={`hotels:${item.slug}`} name={item.name} />
            </div>
          </div>

          {nearbyHotels.length > 0 && (
            <nav className="side-dark" aria-label="חלופות באזור">
              <div className="kicker kicker--on-dark">חלופות באזור</div>
              {nearbyHotels.map((h) => (
                <Link key={h.slug} href={h.url!}>
                  <strong>{h.name}</strong>
                  <span>{h.meta}</span>
                </Link>
              ))}
            </nav>
          )}

          <nav className="side-links" aria-label="עוד באזור">
            {nearbyRestaurants.length > 0 && (
              <>
                <div className="kicker">מסעדות באזור</div>
                {nearbyRestaurants.map((r) => (
                  <Link key={r.slug} href={`/restaurants/?q=${encodeURIComponent(r.name)}`}>
                    <Icon name="restaurant" />
                    {r.name}
                  </Link>
                ))}
              </>
            )}
            <div className="kicker">לתכנן את הטיול</div>
            <Link href="/itineraries/">
              <Icon name="route" />
              מסלולים מוכנים בבאקו
            </Link>
            <Link href="/hotels/">
              <Icon name="hotel" />
              כל המלונות בבאקו
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
