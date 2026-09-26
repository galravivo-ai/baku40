import { FavoritesClient } from "@/components/search/FavoritesClient";
import { buildSearchIndex } from "@/lib/search-index";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    path: "/favorites/",
    fallbackTitle: "הטיול שלי",
    fallbackDescription: "המקומות ששמרתם לטיול לבאקו.",
    robots: "noindex,follow",
  });
}

export default function FavoritesPage() {
  const index = buildSearchIndex().map(({ text: _text, ...e }) => e);
  return (
    <div className="container listing-head narrow-page">
      <h1 className="listing-h1">הטיול שלי</h1>
      <p className="listing-intro">המקומות ששמרתם נשמרים בדפדפן הזה בלבד.</p>
      <FavoritesClient index={index} />
    </div>
  );
}
