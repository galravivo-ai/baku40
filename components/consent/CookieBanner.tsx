"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { consentSummary, OPEN_PREFS, saveConsent, useConsent } from "@/lib/consent";

// Cookie banner and preferences (design 9g). "אישור הכל" and "רק הכרחיות" are
// equal in size and weight; the banner doesn't block scrolling; Esc means
// "רק הכרחיות"; the preferences dialog traps focus.

type Row = { key: "analytics" | "marketing" | null; title: string; tools: string; text: string };
const ROWS: Row[] = [
  { key: null, title: "הכרחיות", tools: "ניווט, אבטחה, שמירת הבחירה הזו", text: "בלעדיהן האתר לא עובד. לא משמשות למעקב." },
  { key: "analytics", title: "מדידה", tools: "Google Analytics", text: "כמה אנשים קוראים כל עמוד ומאיפה הגיעו. בלי זיהוי אישי." },
  { key: "marketing", title: "שיווק", tools: "Meta Pixel · Google Ads", text: "מדידת קמפיינים והצגת מודעות של Baku40 באתרים אחרים." },
];

export function CookieBanner() {
  const consent = useConsent();
  const [prefs, setPrefs] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const bannerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const showBanner = consent === null && !prefs;

  const decide = (analytics: boolean, marketing: boolean) => {
    saveConsent(analytics, marketing);
    setPrefs(false);
    setDone(consentSummary({ analytics, marketing }));
  };

  useEffect(() => {
    const open = () => {
      const c = consent ?? { analytics: false, marketing: false };
      setChoice({ analytics: c.analytics, marketing: c.marketing });
      setPrefs(true);
    };
    window.addEventListener(OPEN_PREFS, open);
    return () => window.removeEventListener(OPEN_PREFS, open);
  }, [consent]);

  // Focus the banner on first view without scrolling the page.
  useEffect(() => {
    if (showBanner) bannerRef.current?.focus({ preventScroll: true });
  }, [showBanner]);

  useEffect(() => {
    if (!prefs) return;
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPrefs(false);
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("button, a[href]")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [prefs]);

  useEffect(() => {
    if (!showBanner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") decide(false, false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showBanner]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(null), 6000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <>
      {showBanner && (
        <div ref={bannerRef} tabIndex={-1} role="dialog" aria-label="הסכמה לעוגיות" className="consent">
          <div className="consent__head">
            <span className="consent__icon">
              <Icon name="cookie" />
            </span>
            <strong>עוגיות, בקצרה</strong>
          </div>
          <p>
            עוגיות הכרחיות מפעילות את האתר. אם תאשרו, נפעיל גם מדידה ושיווק: כך נדע מה עוזר למטיילים, ונוכל להציג לכם
            מודעות של Baku40. <Link href="/privacy/">מדיניות פרטיות</Link>
          </p>
          <div className="consent__actions">
            <button type="button" className="consent__btn consent__btn--primary" onClick={() => decide(true, true)}>
              אישור הכל
            </button>
            <button type="button" className="consent__btn" onClick={() => decide(false, false)}>
              רק הכרחיות
            </button>
          </div>
          <button
            type="button"
            className="consent__more"
            onClick={() => {
              setChoice({ analytics: false, marketing: false });
              setPrefs(true);
            }}
          >
            <Icon name="tune" />
            בחירה לפי סוג
          </button>
        </div>
      )}

      {prefs && (
        <div className="consent-overlay">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="consent-prefs-title" className="consent-prefs">
            <div className="consent-prefs__head">
              <h2 id="consent-prefs-title">מה להפעיל?</h2>
              <button type="button" className="consent-prefs__close" aria-label="סגירה" onClick={() => setPrefs(false)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="consent-prefs__rows">
              {ROWS.map((r) => (
                <div key={r.title} className="consent-row">
                  <div>
                    <div className="consent-row__title">
                      <strong>{r.title}</strong>
                      <span>{r.tools}</span>
                    </div>
                    <p>{r.text}</p>
                  </div>
                  {r.key ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={choice[r.key]}
                      aria-label={r.title}
                      className="switch"
                      onClick={() => setChoice((c) => ({ ...c, [r.key!]: !c[r.key!] }))}
                    >
                      <span />
                    </button>
                  ) : (
                    <span className="consent-row__locked">תמיד פעיל</span>
                  )}
                </div>
              ))}
            </div>
            <div className="consent-prefs__actions">
              <button type="button" className="consent__btn" onClick={() => decide(choice.analytics, choice.marketing)}>
                שמירת הבחירה
              </button>
              <button type="button" className="consent__btn consent__btn--primary" onClick={() => decide(true, true)}>
                אישור הכל
              </button>
            </div>
          </div>
        </div>
      )}

      {done && !prefs && (
        <div className="consent-done" role="status">
          <span>
            <Icon name="check_circle" />
            {done}
          </span>
          <button type="button" className="link-button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFS))}>
            <Icon name="cookie" />
            הגדרות עוגיות
          </button>
        </div>
      )}
    </>
  );
}
