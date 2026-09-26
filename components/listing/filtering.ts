import type { CardData } from "./types";

/**
 * A chip matches a card when any of its "·"-separated parts appears in the
 * card's meta/area/foot/badge/verify text. Price chips (₪₪) must match
 * exactly so "₪₪" does not also select "₪₪₪".
 */
export function chipMatches(label: string, card: CardData): boolean {
  const parts = label.split("·").map((s) => s.trim()).filter(Boolean);
  return parts.some((part) =>
    card.facets.some((f) => (/^₪+$/.test(part) ? f === part : f.includes(part))),
  );
}

/** OR inside a filter group, AND between groups, then free-text search. */
export function applyFilters(
  cards: CardData[],
  groups: { head: string; items: string[] }[],
  selected: Set<string>,
  query: string,
): CardData[] {
  const q = query.trim().toLowerCase();
  return cards.filter((card) => {
    for (const g of groups) {
      const active = g.items.filter((i) => selected.has(i));
      if (active.length && !active.some((label) => chipMatches(label, card))) return false;
    }
    return !q || card.searchText.includes(q);
  });
}
