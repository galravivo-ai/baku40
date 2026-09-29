import "server-only";
import { getAllCollections, getAreas, getHome } from "./content";

// Icons used in code (components) — content icons are collected below.
const CODE_ICONS = [
  "bookmark", "bookmark_border", "castle", "check_circle", "chevron_left", "close", "contrast",
  "directions_walk", "edit_note", "error", "help", "hotel", "image", "location_city", "menu",
  "restaurant", "route", "schedule", "search", "tune",
  // footer accordion, home, cookie banner and accessibility menu
  "accessibility_new", "add", "arrow_back", "arrow_selector_tool", "cookie", "filter_b_and_w",
  "format_line_spacing", "format_size", "link", "motion_photos_paused", "remove", "restart_alt",
  "text_fields", "title",
];

/**
 * Every Material Symbols name the site renders, so the icon font can be
 * requested as a small subset (Google Fonts `icon_names`) instead of ~3MB.
 */
export function usedIcons(): string[] {
  const home = getHome();
  const names = new Set<string>(CODE_ICONS);
  for (const c of getAllCollections()) for (const i of c.items) if (i.icon) names.add(i.icon);
  for (const u of home.hero.utility) names.add(u.icon);
  for (const q of home.quick) names.add(q.icon);
  for (const f of home.firstTime.items) if (f.icon) names.add(f.icon);
  for (const r of home.food.items) names.add(r.icon);
  for (const p of home.practical.items) names.add(p.icon);
  for (const a of getAreas()) for (const b of a.bestFor ?? []) names.add(b.icon);
  return [...names].filter((n) => /^[a-z0-9_]+$/.test(n)).sort();
}
