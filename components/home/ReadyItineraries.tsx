"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Home } from "@/lib/schema";

// "כמה ימים יש לכם בבאקו?" (design 1a): pick a number of days, see the
// ready itineraries written for it. On phones every itinerary is in a
// swipeable row with the matching ones first.

export type ItinCard = {
  slug: string;
  days: number;
  name: string;
  meta: string;
  text: string;
  badge?: string;
  href: string;
  photo: ReactNode;
};

function daysLabel(d: number) {
  return d === 1 ? "ליום אחד" : `ל־${d} ימים`;
}

export function ReadyItineraries({ p, cards }: { p: Home["planner"]; cards: ItinCard[] }) {
  const [days, setDays] = useState(p.defaultDays);
  const matching = cards.filter((c) => c.days === days);
  const title = matching.length === 1 ? `מסלול אחד ${daysLabel(days)}` : `${matching.length} מסלולים ${daysLabel(days)}`;
  const allLabel = p.allLabel.replace("{n}", String(cards.length));
  const ordered = [...matching, ...cards.filter((c) => c.days !== days)];

  const card = (c: ItinCard, badge: string | undefined) => (
    <Link key={c.slug} href={c.href} className="itin2">
      <div className="itin2__media">
        {c.photo}
        {badge && <span className="itin2__badge">{badge}</span>}
      </div>
      <div className="itin2__body">
        <span className="itin2__meta">{c.meta}</span>
        <span className="itin2__name">{c.name}</span>
        <span className="itin2__text">{c.text}</span>
        <span className="itin2__foot">
          <span className="itin2__tag">מסלול עריכתי</span>
          <span className="itin2__cta">{p.cardCta} ←</span>
        </span>
      </div>
    </Link>
  );

  return (
    <div className="ready" id="planner">
      <div className="ready__top">
        <div className="ready__intro">
          <div className="kicker kicker--on-dark">{p.kicker}</div>
          <h2 className="ready__title">{p.title}</h2>
          <p className="ready__text">{p.text}</p>
        </div>
        <div className="ready__days">
          <span id="ready-days-label">{p.daysLabel}</span>
          <div role="group" aria-labelledby="ready-days-label">
            {p.days.map((d) => (
              <button key={d} type="button" aria-pressed={d === days} onClick={() => setDays(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="ready__bar">
        <strong aria-live="polite">{title}</strong>
        <span className="ready__swipe">· החליקו לכל המסלולים</span>
        <Link href={p.href} className="ready__all">
          {allLabel}
        </Link>
      </div>
      {/* desktop: only the matching itineraries */}
      <div className="ready__grid">{matching.map((c) => card(c, c.badge))}</div>
      {/* phones: all itineraries, matching first */}
      <div className="ready__row">
        {ordered.map((c) => card(c, c.days === days ? c.badge || (c.days === 1 ? "מתאים ליום אחד" : `מתאים ל־${c.days} ימים`) : undefined))}
      </div>
      <Link href={p.href} className="ready__all-btn">
        {allLabel}
      </Link>
    </div>
  );
}
