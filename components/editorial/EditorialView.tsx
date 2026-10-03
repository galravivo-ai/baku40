import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Blocks } from "@/components/editorial/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { absoluteUrl, getSite } from "@/lib/content";
import { editorialCrumbs, pageDates } from "@/lib/editorial";
import type { EditorialPage } from "@/lib/schema";
import { breadcrumbJsonLd } from "@/lib/seo";

// Renders an editorial page (content/pages/editorial/*.json).

// Guides get Article markup (author, publisher, dates); legal and system pages don't.
const NOT_ARTICLE = ["/about/", "/contact/", "/privacy/", "/terms/", "/accessibility/", "/affiliate-disclosure/", "/authors/", "/sitemap/", "/credits/"];

export function EditorialView({ page }: { page: EditorialPage }) {
  const crumbs = editorialCrumbs(page);
  const faq = page.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  const headings = page.blocks.filter((b) => b.type === "h2").map((b) => ("text" in b ? b.text : ""));

  const isArticle = !NOT_ARTICLE.some((p) => page.url.startsWith(p));

  const graph: Record<string, unknown>[] = [breadcrumbJsonLd(crumbs)];
  const site = getSite();
  const dates = pageDates(page);
  const publisher = { "@type": "Organization", name: site.name, url: absoluteUrl("/") };
  const author = { "@type": "Organization", name: "מערכת Baku40", url: absoluteUrl("/authors/baku40/") };
  if (isArticle) {
    graph.push({
      "@type": "Article",
      headline: page.h1,
      description: page.intro,
      url: absoluteUrl(page.url),
      inLanguage: "he",
      author,
      publisher,
      ...(dates.published ? { datePublished: dates.published } : {}),
      ...(dates.modified ? { dateModified: dates.modified } : {}),
    });
  }
  if (page.url.startsWith("/attractions/")) {
    graph.push({ "@type": "TouristAttraction", name: page.h1, url: absoluteUrl(page.url), description: page.intro });
  }
  // Venue pages: Restaurant / Store, with the address from the facts block when there is one.
  const venueType =
    page.url.startsWith("/restaurants/") && page.url !== "/restaurants/kosher/"
      ? "Restaurant"
      : page.url.startsWith("/shopping/")
        ? "Store"
        : null;
  if (venueType) {
    const facts = page.blocks.flatMap((b) => (b.type === "facts" ? b.items : []));
    const address = facts.find((f) => f.k === "כתובת")?.v;
    const cuisine = venueType === "Restaurant" ? facts.find((f) => f.k === "מטבח")?.v : undefined;
    graph.push({
      "@type": venueType,
      name: page.meta[0] || page.h1,
      alternateName: page.h1,
      url: absoluteUrl(page.url),
      description: page.intro,
      ...(cuisine ? { servesCuisine: cuisine } : {}),
      ...(address ? { address: { "@type": "PostalAddress", streetAddress: address, addressLocality: "Baku", addressCountry: "AZ" } } : {}),
    });
  }
  if (page.url.startsWith("/destinations/")) {
    graph.push({
      "@type": "TouristDestination",
      name: page.h1,
      url: absoluteUrl(page.url),
      description: page.intro,
      containedInPlace: { "@type": "Country", name: "Azerbaijan" },
    });
  }
  if (page.url.startsWith("/itineraries/")) {
    graph.push({
      "@type": "TouristTrip",
      name: page.h1,
      description: page.intro,
      url: absoluteUrl(page.url),
      touristType: page.meta.slice(1, 2),
    });
  }
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  const [lead, ...rest] = page.images;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
      {lead && (
        <div className={rest.length ? "ed-gallery" : "ed-gallery ed-gallery--single"}>
          <div className="ed-gallery__main">
            <Photo photo={lead.photo} alt={lead.alt} sizes="(max-width: 900px) 100vw, 66vw" priority />
          </div>
          {rest.length > 0 && (
            <div className="ed-gallery__side">
              {rest.slice(0, 2).map((im) => (
                <div key={im.photo}>
                  <Photo photo={im.photo} alt={im.alt} sizes="33vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {page.imageNote && <p className="container ed-image-note">{page.imageNote}</p>}

      <div className="container ed-layout">
        <article className="ed-main">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="ed-h1">{page.h1}</h1>
          {page.intro && <p className="ed-intro">{page.intro}</p>}
          {page.meta.length > 0 && (
            <p className="ed-meta">
              {page.meta.map((m, i) => (
                <span key={m}>
                  {i > 0 && " · "}
                  {m.startsWith("מאת ") ? <Link href="/authors/baku40/">{m}</Link> : m}
                </span>
              ))}
            </p>
          )}
          <Blocks blocks={page.blocks} />
        </article>
        {page.sideNav ? (
          <nav className="ed-toc" aria-label={page.sideNav.title}>
            <div className="kicker">{page.sideNav.title}</div>
            {page.sideNav.links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={l.href === page.url ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
        ) : headings.length > 2 && (
          <nav className="ed-toc" aria-label="בעמוד הזה">
            <div className="kicker">בעמוד הזה</div>
            {headings.map((h, i) => (
              <a key={h} href={`#s${i}`}>
                {h}
              </a>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
