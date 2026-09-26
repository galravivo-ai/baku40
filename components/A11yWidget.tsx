"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { A11Y_KEY as KEY } from "@/lib/a11y";

// Accessibility menu (design 9h). Each option is a class on <html>
// (a11y-contrast, a11y-links…) plus a text-size step; saved in localStorage
// and applied before first paint by A11Y_BOOT (lib/a11y.ts) in the root layout.
// It complements the site's own ת"י 5568 AA compliance, it doesn't replace it.

const SIZES = [1, 1.15, 1.3, 1.5];
const TILES = [
  ["contrast", "contrast", "ניגודיות גבוהה"],
  ["gray", "filter_b_and_w", "גווני אפור"],
  ["links", "link", "הדגשת קישורים"],
  ["readable", "text_fields", "גופן קריא"],
  ["spacing", "format_line_spacing", "ריווח טקסט"],
  ["motion", "motion_photos_paused", "עצירת אנימציות"],
  ["cursor", "arrow_selector_tool", "סמן גדול"],
  ["headings", "title", "הדגשת כותרות"],
] as const;
type Key = (typeof TILES)[number][0];
type Settings = { size: number } & Partial<Record<Key, boolean>>;


function apply(s: Settings) {
  const h = document.documentElement;
  for (const c of [...h.classList]) if (c.startsWith("a11y-")) h.classList.remove(c);
  if (s.size > 0) h.classList.add(`a11y-size-${s.size}`);
  for (const [k] of TILES) if (s[k]) h.classList.add(`a11y-${k}`);
}

export function A11yWidget() {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Settings>({ size: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (saved && typeof saved === "object") setS({ size: 0, ...saved });
    } catch {
      // nothing saved
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const update = (next: Settings) => {
    setS(next);
    apply(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // applies to this page view only
    }
  };

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="a11y">
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          className="a11y__fab"
          aria-label="תפריט נגישות (Alt+A)"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <Icon name="accessibility_new" />
        </button>
      )}
      {open && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="a11y-title" className="a11y__panel">
          <div className="a11y__head">
            <Icon name="accessibility_new" />
            <h2 id="a11y-title">נגישות</h2>
            <button
              type="button"
              className="a11y__close"
              aria-label="סגירת תפריט הנגישות"
              onClick={() => {
                setOpen(false);
                setTimeout(() => buttonRef.current?.focus(), 0);
              }}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="a11y__body">
            <div className="a11y__size">
              <Icon name="format_size" />
              <span>גודל טקסט</span>
              <div className="a11y__stepper">
                <button type="button" aria-label="הקטנת טקסט" onClick={() => update({ ...s, size: Math.max(0, s.size - 1) })}>
                  א−
                </button>
                <output aria-live="polite">{Math.round(SIZES[s.size] * 100)}%</output>
                <button type="button" aria-label="הגדלת טקסט" onClick={() => update({ ...s, size: Math.min(3, s.size + 1) })}>
                  א+
                </button>
              </div>
            </div>
            <div className="a11y__tiles">
              {TILES.map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  role="switch"
                  aria-checked={!!s[key]}
                  className="a11y__tile"
                  onClick={() => update({ ...s, [key]: !s[key] })}
                >
                  <Icon name={icon} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="a11y__foot">
              <button type="button" className="link-button" onClick={() => update({ size: 0 })}>
                <Icon name="restart_alt" />
                איפוס
              </button>
              <Link href="/accessibility/">הצהרת נגישות</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
