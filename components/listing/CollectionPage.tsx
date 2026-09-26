import Image from "next/image";
import Link from "next/link";
import { bookingHref } from "@/lib/booking";
import {
  countText,
  getAllCollections,
  getCollection,
  getPhoto,
  getSite,
  verifyKind,
  type CollectionKey,
} from "@/lib/content";
import type { Item } from "@/lib/schema";
import { collectionJsonLd, parseCrumbs, type Crumb } from "@/lib/seo";
import { JsonLd } from "../JsonLd";
import { ListingClient } from "./ListingClient";
import type { CardData } from "./types";

// Records get their own page in stage 3 (hotels first). Until a detail route
// exists, cards are not linked, so the site never links to a 404.
const COLLECTIONS_WITH_DETAIL_PAGES = new Set<CollectionKey>();

function toCard(key: CollectionKey, item: Item): CardData {
  const site = getSite();
  const isHotel = key === "hotels";
  const segments = (s: string | null | undefined) =>
    (s ?? "").split("·").map((x) => x.trim()).filter(Boolean);
  const facets = [
    ...segments(item.meta),
    ...segments(item.verify),
    item.area ?? "",
    item.district ?? "",
    item.foot,
    item.badge,
  ].filter(Boolean);
  return {
    id: `${key}:${item.slug}`,
    name: item.name,
    meta: item.meta,
    text: item.text,
    foot: item.foot,
    icon: item.icon,
    cta: item.cta,
    badge: item.badge,
    href: item.url && COLLECTIONS_WITH_DETAIL_PAGES.has(key) ? item.url : undefined,
    booking: isHotel
      ? {
          href: bookingHref(item),
          disclosure: site.affiliateDisclosureShort,
          disclosureHref: "/affiliate-disclosure/",
        }
      : undefined,
    photo: getPhoto(item.photo, item.photoNote, item.photoAlt),
    verify: item.verify,
    verifyKind: verifyKind(item.verify),
    facets,
    searchText: [item.name, item.meta, item.text, item.area, item.foot]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="פירורי לחם" className="crumbs">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.label}>
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CollectionPage({ collectionKey }: { collectionKey: CollectionKey }) {
  const c = getCollection(collectionKey);
  const crumbs = parseCrumbs(c.crumbs, c.url);
  const cards = c.items.map((item) => toCard(collectionKey, item));
  const hero = c.heroPhoto ? getPhoto(c.heroPhoto, "", c.heroPhotoAlt ?? "") : null;
  const related = getAllCollections().filter((o) => o.url !== c.url);

  return (
    <>
      <JsonLd data={collectionJsonLd(c, crumbs)} />

      {c.layout === "landing" && (
        <div className="hero">
          {hero && <Image className="hero__img" src={hero.src} alt={hero.alt} fill priority sizes="100vw" />}
          <div className="hero__shade" />
          <div className="hero__body">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="hero__h1">{c.h1}</h1>
            <p className="hero__intro">{c.intro}</p>
          </div>
        </div>
      )}

      <div className="container listing-head">
        {c.layout === "plain" && (
          <>
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="listing-h1">{c.h1}</h1>
            <p className="listing-intro">{c.intro}</p>
          </>
        )}
        <ListingClient
          cards={cards}
          groups={c.filterGroups}
          searchPlaceholder={c.searchPlaceholder}
          sort={c.sort}
          countText={countText(c)}
        />
      </div>

      <section className="container editorial" aria-labelledby="editorial-heading">
        <div className="editorial__card">
          <h2 id="editorial-heading">{c.seo.editorialHeading}</h2>
          <p>{c.seo.editorialBody}</p>
          <aside className="info-box">
            <h3 className="info-box__title">{c.box.title}</h3>
            <p className="info-box__text">{c.box.text}</p>
          </aside>
        </div>
      </section>

      <nav className="container related" aria-labelledby="related-heading">
        <h2 id="related-heading" className="related__head">
          קטגוריות קרובות
        </h2>
        <ul className="related__links">
          {related.map((o) => (
            <li key={o.url}>
              <Link href={o.url}>{o.h1}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
