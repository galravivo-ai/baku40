"use client";

import Link from "next/link";
import { useState } from "react";
import { useSaved } from "@/lib/saved";

export type StripItem = {
  id: string;
  name: string;
  meta: string;
  note: string;
  dur: string;
  tags: string[];
  href: string;
  photo: React.ReactNode;
};

export function AttractionsStrip({ filters, items }: { filters: string[]; items: StripItem[] }) {
  const [filter, setFilter] = useState(filters[0]);
  const { has, toggle } = useSaved();
  const all = filter === filters[0];
  const visible = all ? items : items.filter((a) => a.tags.includes(filter));
  return (
    <>
      <div className="chip-row" role="group" aria-label="סינון אטרקציות">
        {filters.map((f) => (
          <button key={f} type="button" className="chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="strip">
        {visible.map((a) => {
          const id = `attractions:${a.id}`;
          const saved = has(id);
          return (
            <article key={a.id} className="strip-card">
              <div className="strip-card__media">
                {a.photo}
                <button
                  type="button"
                  className="save-pill"
                  aria-pressed={saved}
                  onClick={() => toggle(id)}
                  aria-label={saved ? `הסרת ${a.name} מהטיול שלי` : `שמירת ${a.name} בטיול שלי`}
                >
                  {saved ? "✓ נשמר" : "+ שמירה"}
                </button>
              </div>
              <div className="strip-card__body">
                <div className="card__meta">{a.meta}</div>
                <h3 className="card__name">
                  <Link href={a.href}>{a.name}</Link>
                </h3>
                <p className="card__text">{a.note}</p>
                <div className="card__fill" />
                <div className="strip-card__foot">
                  <span>{a.dur}</span>
                  <span className="dot" aria-hidden="true" />
                  <span>{a.tags.join(" · ")}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
