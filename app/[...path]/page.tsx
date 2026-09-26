import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Blocks } from "@/components/editorial/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { absoluteUrl, getEditorialPage, getEditorialPages, getSite } from "@/lib/content";
import { editorialCrumbs, editorialMetadata, pageDates } from "@/lib/editorial";
import { breadcrumbJsonLd } from "@/lib/seo";

// Every file in content/pages/editorial/ becomes a page at its `url`.

export const dynamicParams = false;

export function generateStaticParams() {
  return getEditorialPages().map((p) => ({ path: p.url.split("/").filter(Boolean) }));
}

type Props = { params: Promise<{ path: string[] }> };

async function load(params: Props["params"]) {
  const { path } = await params;
  const page = getEditorialPage(`/${path.map(decodeURIComponent).join("/")}/`);
  if (!page) notFound();
  return page;
}

export async function generateMetadata({ params }: Props) {
  return editorialMetadata(await load(params));
}

export default async function EditorialRoute({ params }: Props) {
  const page = await load(params);
  const crumbs = editorialCrumbs(page);
  const headings = page.blocks.filter((b) => b.type === "h2").map((b) => ("text" in b ? b.text : ""));
  const faq = page.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  const isArticle = page.url.startsWith("/magazine/");

  const graph: Record<string, unknown>[] = [breadcrumbJsonLd(crumbs)];
  const site = getSite();
  const dates = pageDates(page);
  const publisher = { "@type": "Organization", name: site.name, url: absoluteUrl("/") };
  if (isArticle) {
    graph.push({
      "@type": "Article",
      headline: page.h1,
      url: absoluteUrl(page.url),
      inLanguage: "he",
      author: publisher,
      publisher,
      ...(dates.published ? { datePublished: dates.published } : {}),
      ...(dates.modified ? { dateModified: dates.modified } : {}),
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
          {page.meta.length > 0 && <p className="ed-meta">{page.meta.join(" · ")}</p>}
          <Blocks blocks={page.blocks} />
        </article>
        {headings.length > 2 && (
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
