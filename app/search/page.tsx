import { SearchClient } from "@/components/search/SearchClient";
import { getHome } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search-index";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return {
    ...pageMetadata({ path: "/search/", fallbackTitle: "חיפוש", fallbackDescription: "חיפוש באתר Baku40.", robots: "noindex,follow" }),
  };
}

export default function SearchPage() {
  return (
    <div className="container listing-head narrow-page">
      <h1 className="listing-h1">חיפוש</h1>
      <SearchClient index={buildSearchIndex()} placeholder={getHome().hero.searchPlaceholder} />
    </div>
  );
}
