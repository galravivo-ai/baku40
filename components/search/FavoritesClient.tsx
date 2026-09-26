"use client";

import Link from "next/link";
import { useSaved } from "@/lib/saved";

type Entry = { id: string; group: string; name: string; meta: string; href: string };

export function FavoritesClient({ index }: { index: Entry[] }) {
  const { list, toggle } = useSaved();
  const byId = new Map(index.map((e) => [e.id, e]));
  const saved = list.map((id) => byId.get(id)).filter((e): e is Entry => !!e);

  if (!saved.length) {
    return (
      <div className="empty-state">
        <strong>עוד לא שמרתם מקומות</strong>
        לחצו על סימן השמירה בכרטיס של מלון, מסעדה או אטרקציה, והוא יופיע כאן.{" "}
        <Link href="/attractions/">לאטרקציות</Link> · <Link href="/hotels/">למלונות</Link>
      </div>
    );
  }
  return (
    <ul className="fav-list">
      {saved.map((e) => (
        <li key={e.id}>
          <Link href={e.href}>
            <span className="kicker">{e.group}</span>
            <strong>{e.name}</strong>
            {e.meta && <span>{e.meta}</span>}
          </Link>
          <button type="button" className="clear-btn" onClick={() => toggle(e.id)}>
            הסרה
          </button>
        </li>
      ))}
    </ul>
  );
}
