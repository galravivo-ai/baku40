"use client";
import { useSyncExternalStore } from "react";

// Cookie consent (design 9g). Stored in localStorage for 12 months; a new
// VERSION (e.g. when the list of tools changes) asks again.
const KEY = "baku40_consent";
const VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const CHANGE = "baku40:consent-change";
export const OPEN_PREFS = "baku40:consent-open";

export type Consent = { analytics: boolean; marketing: boolean; date: string; version: number };

let cachedRaw: string | null | undefined;
let cached: Consent | null = null;

function read(): Consent | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  cached = null;
  try {
    const c = raw ? (JSON.parse(raw) as Consent) : null;
    if (c && c.version === VERSION && Date.now() - Date.parse(c.date) < MAX_AGE_MS) cached = c;
  } catch {
    // corrupt value: ask again
  }
  return cached;
}

export function saveConsent(analytics: boolean, marketing: boolean) {
  const c: Consent = { analytics, marketing, date: new Date().toISOString(), version: VERSION };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // storage unavailable: the choice applies to this page view only
    cachedRaw = JSON.stringify(c);
    cached = c;
  }
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE, cb);
    window.removeEventListener("storage", cb);
  };
}

/** undefined while rendering on the server, null when no valid choice was made yet. */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function consentSummary(c: Pick<Consent, "analytics" | "marketing">) {
  if (c.analytics && c.marketing) return "אישרתם את כל העוגיות";
  if (!c.analytics && !c.marketing) return "רק עוגיות הכרחיות פעילות";
  return c.analytics ? "פעילות: הכרחיות ומדידה" : "פעילות: הכרחיות ושיווק";
}
