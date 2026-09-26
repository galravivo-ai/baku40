"use client";

import Link from "next/link";
import { useState } from "react";

export type AreaTab = {
  label: string;
  items: { name: string; meta: string; href?: string; photo: React.ReactNode }[];
};

export function AreaTabs({ tabs }: { tabs: AreaTab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active] ?? tabs[0];
  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            className="tab"
            onClick={() => setActive(i)}
          >
            {t.label}
            <span className="tab__count">{t.items.length}</span>
          </button>
        ))}
      </div>
      <ul className="area-items" role="tabpanel">
        {tab.items.map((i) => (
          <li key={i.name} className="area-item">
            <div className="area-item__media">{i.photo}</div>
            <div className="area-item__body">
              <strong>{i.href ? <Link href={i.href}>{i.name}</Link> : i.name}</strong>
              <span>{i.meta}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
