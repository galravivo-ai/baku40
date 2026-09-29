"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useSaved } from "@/lib/saved";

// "מה באמת שווה לראות" (design Home v2): filter chips, a mosaic of five on
// desktop (the first one 2×2), and a swipe row of all matches on phones.

export type StripItem = {
  id: string;
  name: string;
  meta: string;
  note: string;
  dur: string;
  tags: string[];
  href: string;
  photo: React.ReactNode | null;
};

export function AttractionsStrip({ filters, items }: { filters: string[]; items: StripItem[] }) {
  const [filter, setFilter] = useState(filters[0]);
  const { has, toggle } = useSaved();
  const visible = filter === filters[0] ? items : items.filter((a) => a.tags.includes(filter));

  const tile = (a: StripItem, big: boolean) => {
    const id = `attractions:${a.id}`;
    const saved = has(id);
    return (
      <div key={a.id} className={big ? "mosaic__tile mosaic__tile--big" : "mosaic__tile"}>
        {a.photo}
        <span className="mosaic__shade" />
        <Link href={a.href} className="mosaic__link">
          <span className="mosaic__meta">{a.meta}</span>
          <span className="mosaic__name">{a.name}</span>
          {big && <span className="mosaic__note">{a.note}</span>}
        </Link>
        <button
          type="button"
          className="mosaic__save"
          aria-pressed={saved}
          onClick={() => toggle(id)}
          aria-label={saved ? `הסרת ${a.name} מהשמורים` : `שמירת ${a.name}`}
        >
          <Icon name="favorite" />
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="mosaic__chips" role="group" aria-label="סינון אטרקציות">
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={f === filter} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="mosaic__grid">{visible.slice(0, 5).map((a, i) => tile(a, i === 0))}</div>
      <div className="mosaic__row">{visible.map((a) => tile(a, false))}</div>
      {visible.length === 0 && <p className="mosaic__empty">אין אטרקציות בסינון הזה.</p>}
    </>
  );
}
