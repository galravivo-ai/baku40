"use client";

import { OPEN_PREFS } from "@/lib/consent";

/** Footer link that reopens the cookie preferences (design 9g). */
export function CookieSettingsLink() {
  return (
    <button type="button" className="link-button" onClick={() => window.dispatchEvent(new Event(OPEN_PREFS))}>
      הגדרות עוגיות
    </button>
  );
}
