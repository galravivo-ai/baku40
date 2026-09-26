"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../Icon";
import { Card } from "./Card";
import { applyFilters } from "./filtering";
import type { CardData, FilterGroup } from "./types";

type Props = {
  cards: CardData[];
  groups: FilterGroup[];
  searchPlaceholder: string;
  sort: string;
  countText: string;
};

// Filter state lives in the query string (?f=…&q=…) so a filtered view can be
// shared; canonical still points at the collection page itself.
function readUrl(): { selected: Set<string>; q: string } {
  const params = new URLSearchParams(window.location.search);
  return { selected: new Set(params.getAll("f")), q: params.get("q") ?? "" };
}

function writeUrl(selected: Set<string>, q: string) {
  const params = new URLSearchParams();
  for (const f of selected) params.append("f", f);
  if (q.trim()) params.set("q", q.trim());
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
  window.history.replaceState(window.history.state, "", url);
}

function Chips({
  groups,
  selected,
  onToggle,
}: {
  groups: FilterGroup[];
  selected: Set<string>;
  onToggle: (label: string) => void;
}) {
  return (
    <>
      {groups.map((g) => (
        <fieldset key={g.head} className="filter-group">
          <legend className="filter-group__head">{g.head}</legend>
          <div className="filter-group__chips">
            {g.items.map((label) => (
              <button
                key={label}
                type="button"
                className="chip"
                aria-pressed={selected.has(label)}
                onClick={() => onToggle(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}

export function ListingClient({ cards, groups, searchPlaceholder, sort, countText }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const initial = readUrl();
    setSelected(initial.selected);
    setQ(initial.q);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheet]);

  const update = (next: Set<string>, nextQ: string) => {
    setSelected(next);
    setQ(nextQ);
    writeUrl(next, nextQ);
  };

  const toggle = (label: string) => {
    const next = new Set(selected);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    update(next, q);
  };

  const visible = useMemo(() => applyFilters(cards, groups, selected, q), [cards, groups, selected, q]);
  const filtering = selected.size > 0 || q.trim() !== "";

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__row">
          <label className="search-field">
            <Icon name="search" />
            <span className="visually-hidden">{searchPlaceholder}</span>
            <input
              type="search"
              value={q}
              placeholder={searchPlaceholder}
              onChange={(e) => update(selected, e.target.value)}
            />
          </label>
          <div className="sort-label">מיון: {sort}</div>
        </div>
        {groups.length > 0 && (
          <div className="filter-groups">
            <Chips groups={groups} selected={selected} onToggle={toggle} />
          </div>
        )}
        <div className="toolbar__count" aria-live="polite">
          <strong>{filtering ? `${visible.length} מתוך ${cards.length}` : countText}</strong>
          {filtering && (
            <button type="button" className="clear-btn" onClick={() => update(new Set(), "")}>
              ניקוי סינון
            </button>
          )}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="card-grid">
          {visible.map((card, i) => (
            <Card key={card.id} card={card} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>אין תוצאות לסינון הזה</strong>
          נסו להסיר חלק מהמסננים או לחפש מילה אחרת.
        </div>
      )}

      {groups.length > 0 && (
        <div className="mobile-bar">
          <button type="button" className="btn btn--outline" onClick={() => setSheet(true)}>
            <Icon name="tune" />
            סינון{selected.size > 0 ? ` (${selected.size})` : ""}
          </button>
        </div>
      )}

      {sheet && (
        <>
          <div className="sheet-backdrop" onClick={() => setSheet(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="סינון">
            <div className="sheet__head">
              סינון
              <button type="button" className="drawer__close" aria-label="סגירה" onClick={() => setSheet(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="sheet__body">
              <Chips groups={groups} selected={selected} onToggle={toggle} />
            </div>
            <div className="sheet__foot">
              <button type="button" className="btn btn--outline" onClick={() => update(new Set(), q)}>
                ניקוי
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setSheet(false)}>
                הצגת {visible.length} תוצאות
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
