"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../Icon";

type Entry = { id: string; group: string; name: string; meta: string; href: string; text: string };

export function SearchClient({ index, placeholder }: { index: Entry[]; placeholder: string }) {
  const [q, setQ] = useState("");
  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);
  const update = (value: string) => {
    setQ(value);
    const url = value.trim() ? `?q=${encodeURIComponent(value.trim())}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  };

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const words = term.split(/\s+/);
    const hits = index.filter((e) => {
      const hay = e.text.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    const map = new Map<string, Entry[]>();
    for (const h of hits) map.set(h.group, [...(map.get(h.group) ?? []), h]);
    return [...map.entries()];
  }, [q, index]);

  const total = groups.reduce((n, [, items]) => n + items.length, 0);

  return (
    <>
      <form role="search" className="search-field search-field--big" onSubmit={(e) => e.preventDefault()}>
        <Icon name="search" />
        <label className="visually-hidden" htmlFor="q">
          {placeholder}
        </label>
        <input id="q" type="search" value={q} placeholder={placeholder} onChange={(e) => update(e.target.value)} autoFocus />
      </form>
      {q.trim() && (
        <p className="toolbar__count" aria-live="polite">
          <strong>{total ? `${total} תוצאות` : "לא נמצאו תוצאות"}</strong>
        </p>
      )}
      <div className="search-results">
        {groups.map(([group, items]) => (
          <section key={group}>
            <h2 className="kicker">{group}</h2>
            <ul>
              {items.map((e) => (
                <li key={e.id}>
                  <Link href={e.href}>
                    <strong>{e.name}</strong>
                    {e.meta && <span>{e.meta}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
