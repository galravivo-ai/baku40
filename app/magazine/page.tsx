import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { getEditorialPages, getHome } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

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
  return (
    <div className="container listing-head">
      <Breadcrumbs crumbs={[{ label: "דף הבית", href: "/" }, { label: "מגזין", href: "/magazine/" }]} />
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
      <div className="related" />
    </div>
  );
}
