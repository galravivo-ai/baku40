import Link from "next/link";
import { getAllCollections } from "@/lib/content";

export const metadata = { title: "העמוד לא נמצא", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container listing-head">
      <h1 className="listing-h1">העמוד לא נמצא</h1>
      <p className="listing-intro">ייתכן שהכתובת השתנתה או שהעמוד עדיין בבנייה. אפשר להמשיך מכאן:</p>
      <ul className="related__links">
        <li>
          <Link href="/">דף הבית</Link>
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
