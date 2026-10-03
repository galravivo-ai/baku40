import type { FaqItem } from "@/lib/seo";
import type { Area, Item } from "@/lib/schema";

// Questions and answers built only from fields already on the page, so every
// answer is something the page itself states. Lists are joined into plain
// Hebrew ("א, ב וג") rather than dotted fragments.

/** "א, ב וג": joins short phrases the way people write them. */
export function joinHe(xs: string[] | undefined): string {
  const items = (xs ?? []).map((x) => x.trim().replace(/[.。]$/, "")).filter(Boolean);
  if (items.length <= 1) return items[0] ?? "";
  const last = items[items.length - 1];
  const and = /^[֐-׿]/.test(last) ? `ו${last}` : `ו־${last}`;
  return `${items.slice(0, -1).join(", ")} ${and}`;
}

/** "הטיילת" → "בטיילת", "סבאיל" → "בסבאיל". */
export function inPlace(name: string): string {
  return name.startsWith("ה") ? `ב${name.slice(1)}` : `ב${name}`;
}

const sentences = (xs: string[] | undefined) =>
  (xs ?? []).map((x) => x.trim().replace(/[.]?$/, ".")).join(" ");

export function hotelFaq(h: Item, areaName?: string): FaqItem[] {
  const name = h.nameHe ?? h.name;
  const area = areaName ?? h.area;
  const out: FaqItem[] = [];
  if (h.stars) out.push({ q: `כמה כוכבים יש ל${name}?`, a: `זה מלון ${h.stars} כוכבים.` });
  if (area) out.push({ q: `איפה נמצא ${name}?`, a: `${inPlace(area)}.${h.text ? ` ${h.text}` : ""}` });
  if (h.bottomLine) out.push({ q: `למי ${name} מתאים?`, a: h.bottomLine });
  if (h.facilities?.length) out.push({ q: "מה יש במלון?", a: `${joinHe(h.facilities)}.` });
  if (h.pros?.length) out.push({ q: `מה טוב ב${name}?`, a: `${joinHe(h.pros)}.` });
  if (h.cons?.length) out.push({ q: `מה פחות טוב?`, a: `${joinHe(h.cons)}.` });
  if (h.checklist?.length) out.push({ q: "מה לבדוק לפני שמזמינים?", a: sentences(h.checklist) });
  out.push({
    q: "יש כשרות במלון?",
    a: "לא. לא מצאנו בבאקו מלון שמפעיל כשרות בעצמו. אפשר להזמין אוכל כשר מהקהילה היהודית ישר למלון, והפרטים בעמוד הכשרות.",
  });
  return out;
}

export function areaFaq(a: Area, hotelNames: string[]): FaqItem[] {
  const name = a.name.replace(/\s*\(.*\)$/, "");
  const out: FaqItem[] = [];
  const fits = a.fits?.paragraphs?.[0];
  if (fits) out.push({ q: `למי מתאים לישון ${inPlace(name)}?`, a: fits });
  if (a.gettingThere?.text) out.push({ q: `איך מגיעים ל${name.replace(/^ה/, "")} ואיך מסתובבים שם?`, a: a.gettingThere.text });
  const sights = a.whatsHere?.[0]?.items?.map((i) => i.name) ?? [];
  if (sights.length) out.push({ q: `מה יש לראות ${inPlace(name)}?`, a: `${joinHe(sights)}.` });
  if (a.pros?.length) out.push({ q: `מה טוב ${inPlace(name)}?`, a: `${joinHe(a.pros)}.` });
  if (a.cons?.length) out.push({ q: `ומה פחות?`, a: `${joinHe(a.cons)}.` });
  if (hotelNames.length) out.push({ q: `אילו מלונות יש ${inPlace(name)}?`, a: `באתר יש עמודים ל${joinHe(hotelNames)}.` });
  return out;
}
