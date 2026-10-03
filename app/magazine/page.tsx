import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, getEditorialPages, getHome } from "@/lib/content";
import { breadcrumbJsonLd, orgRef, pageMetadata } from "@/lib/seo";

const FAQ = [
  { q: "מה יש במגזין?", a: "כתבות ומדריכים לטיול בבאקו: מסלולים, אוכל, טיפים למשפחות ומידע מעשי. כתבות חדשות נוספות לאורך הזמן." },
  { q: "מי כותב את הכתבות?", a: "מערכת Baku40. כל כתבה מציינת את המקורות שעליהם היא מבוססת ומתי נבדקה." },
  { q: "איפה המידע המעשי לפני הטיסה?", a: "ויזה, כסף, תקשורת, תחבורה ובטיחות מרוכזים בעמודי המידע למטייל." },
];

export function generateMetadata() {
  return pageMetadata({
    path: "/magazine/",
    fallbackTitle: "מגזין",
    fallbackDescription: "כתבות ומדריכים לטיול בבאקו: מסלולים, אוכל, טיפים ומשפחות.",
  });
}

export default function MagazinePage() {
  const articles = getEditorialPages().filter((p) => p.url.startsWith("/magazine/"));
  const teasers = getHome().magazine.items;
  const crumbs = [
    { label: "דף הבית", href: "/" },
    { label: "מגזין", href: "/magazine/" },
  ];
  return (
    <div className="container listing-head">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": absoluteUrl("/magazine/"),
              url: absoluteUrl("/magazine/"),
              name: "מגזין Baku40",
              inLanguage: "he",
              publisher: orgRef(),
              hasPart: articles.map((a) => ({ "@type": "Article", headline: a.h1, url: absoluteUrl(a.url) })),
            },
            breadcrumbJsonLd(crumbs),
          ],
        }}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1 className="listing-h1">מגזין</h1>
      <div className="grid-3">
        {articles.map((a) => {
          const img = a.images[0] ?? a.blocks.find((b) => b.type === "image");
          return (
            <Link key={a.url} href={a.url} className="mag-card">
              <div className="mag-card__media">
                {img && "photo" in img ? <Photo photo={img.photo} alt="" sizes="400px" /> : null}
              </div>
              <span className="mag-card__title">{a.h1}</span>
              <span className="mag-card__text">{a.intro}</span>
            </Link>
          );
        })}
        {teasers.map((m) => (
          <div key={m.title} className="mag-card mag-card--soon">
            <div className="mag-card__media">
              <Photo photo={m.photo} alt="" sizes="400px" />
            </div>
            <span className="mag-card__cat">{m.cat} · בקרוב</span>
            <span className="mag-card__title">{m.title}</span>
            <span className="mag-card__text">{m.text}</span>
          </div>
        ))}
      </div>
      <FaqSection items={FAQ} title="שאלות נפוצות על המגזין" url="/magazine/" />
      <div className="related" />
    </div>
  );
}
