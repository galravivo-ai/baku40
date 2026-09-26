import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getAllCollections, getHome } from "@/lib/content";

export const metadata = { title: "העמוד לא נמצא", robots: { index: false } };

// 404 (SEO spec §6): search box and links to every collection; Next returns status 404.
export default function NotFound() {
  return (
    <div className="container listing-head narrow-page">
      <h1 className="listing-h1">העמוד לא נמצא</h1>
      <p className="listing-intro">ייתכן שהכתובת השתנתה או שהעמוד הוסר. אפשר לחפש, או להמשיך מאחד האוספים:</p>
      <form action="/search/" role="search" className="search-field search-field--big">
        <Icon name="search" />
        <label className="visually-hidden" htmlFor="nf-q">
          חיפוש באתר
        </label>
        <input id="nf-q" name="q" type="search" placeholder={getHome().hero.searchPlaceholder} />
      </form>
      <ul className="related__links">
        <li>
          <Link href="/">דף הבית</Link>
        </li>
        <li>
          <Link href="/attractions/">אטרקציות בבאקו</Link>
        </li>
        {getAllCollections().map((c) => (
          <li key={c.url}>
            <Link href={c.url}>{c.h1}</Link>
          </li>
        ))}
      </ul>
      <div className="related" />
    </div>
  );
}
