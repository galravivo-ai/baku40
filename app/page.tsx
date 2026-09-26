import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, getAllCollections, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Interim home page for stages 1–2: links into the collections. The designed
// home page (Baku40 Home.dc.html) replaces it in stage 3.

export function generateMetadata() {
  const site = getSite();
  const page = site.staticPages.find((p) => p.url === "/");
  return pageMetadata({
    path: "/",
    title: page?.metaTitle,
    fallbackTitle: site.defaultTitle,
    description: page?.metaDescription,
    fallbackDescription: site.defaultDescription,
    robots: page?.robots,
  });
}

export default function Home() {
  const site = getSite();
  const collections = getAllCollections();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: site.name, url: absoluteUrl("/"), inLanguage: "he" },
            site.organization,
          ],
        }}
      />
      <div className="container listing-head">
        <h1 className="listing-h1">{site.defaultTitle}</h1>
        <p className="listing-intro">{site.defaultDescription}</p>
        <div className="card-grid">
          {collections.map((c) => (
            <article key={c.url} className="card">
              <div className="card__body">
                <h2 className="card__name">
                  <Link href={c.url}>{c.h1}</Link>
                </h2>
                <p className="card__text">{c.intro}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="related" />
    </>
  );
}
