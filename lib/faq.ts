import type { FaqItem } from "@/lib/seo";
import type { Area, Item } from "@/lib/schema";

// Questions and answers built only from fields already on the page, so every
// answer is something the page itself states.

const list = (xs: string[] | undefined) => (xs ?? []).filter(Boolean).join(" · ");

export function hotelFaq(h: Item, areaName?: string): FaqItem[] {
  const name = h.nameHe ?? h.name;
  const out: FaqItem[] = [];
  if (h.stars) out.push({ q: `כמה כוכבים יש ל${name}?`, a: `${h.stars} כוכבים.` });
  if (areaName || h.area) out.push({ q: `איפה נמצא ${name}?`, a: `ב${areaName ?? h.area}, באקו.${h.text ? ` ${h.text}` : ""}` });
  if (h.bottomLine) out.push({ q: `למי ${name} מתאים?`, a: h.bottomLine });
  if (h.facilities?.length) out.push({ q: `אילו מתקנים יש במלון?`, a: list(h.facilities) });
  if (h.pros?.length) out.push({ q: `מה היתרונות של ${name}?`, a: list(h.pros) });
  if (h.cons?.length) out.push({ q: `מה החסרונות של ${name}?`, a: list(h.cons) });
  if (h.checklist?.length) out.push({ q: `מה כדאי לבדוק לפני שמזמינים?`, a: list(h.checklist) });
  out.push({ q: `יש כשרות במלון?`, a: "לא מצאנו בבאקו מלון שמפעיל בעצמו הסדר כשרות. האפשרויות לשומרי כשרות, כולל משלוח ארוחות למלון, מרוכזות בעמוד הכשרות." });
  return out;
}

export function areaFaq(a: Area, hotelNames: string[]): FaqItem[] {
  const name = a.name.replace(/\s*\(.*\)$/, "");
  const out: FaqItem[] = [];
  const fits = a.fits?.paragraphs?.[0];
  if (fits) out.push({ q: `למי מתאים ${name}?`, a: fits });
  if (a.gettingThere?.text) out.push({ q: `איך מגיעים ל${name} ואיך מתניידים?`, a: a.gettingThere.text });
  const sights = a.whatsHere?.[0]?.items?.map((i) => i.name) ?? [];
  if (sights.length) out.push({ q: `מה יש לראות ב${name}?`, a: list(sights) });
  if (a.pros?.length) out.push({ q: `מה היתרונות של ${name}?`, a: list(a.pros) });
  if (a.cons?.length) out.push({ q: `מה החסרונות של ${name}?`, a: list(a.cons) });
  if (hotelNames.length) out.push({ q: `אילו מלונות יש ב${name}?`, a: list(hotelNames) });
  return out;
}
