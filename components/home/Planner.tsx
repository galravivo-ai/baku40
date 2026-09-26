"use client";

import { useState } from "react";
import type { Home } from "@/lib/schema";

const DAY_OPTIONS = [1, 2, 3, 4, 5];
const FLEX_DAY = "יום גמיש: השלמות בעיר, אזור שלא הספקתם או חזרה למקום שאהבתם.";

export function Planner({ p }: { p: Home["planner"] }) {
  const [days, setDays] = useState(3);
  const [who, setWho] = useState(p.who[0]);
  const [interests, setInterests] = useState<string[]>(p.interests.slice(0, 1));
  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const plan = Array.from({ length: days }, (_, i) => {
    let text = p.days[i] ?? FLEX_DAY;
    if (who === "משפחה" && i === 1) text = p.kidsDay2;
    return { day: `יום ${i + 1}`, text };
  });
  const title = `${days} ימים · ${who}${interests.length ? " · " + interests.join(", ") : ""}`;

  return (
    <div className="planner" id="planner">
      <div>
        <div className="kicker kicker--on-dark">{p.kicker}</div>
        <h2 className="planner__title">{p.title}</h2>
        <p className="planner__text">{p.text}</p>
        <div className="planner__groups">
          <div>
            <div className="planner__label">{p.daysLabel}</div>
            <div className="planner__options">
              {DAY_OPTIONS.map((d) => (
                <button key={d} type="button" className="p-opt p-opt--day" aria-pressed={d === days} onClick={() => setDays(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="planner__label">{p.whoLabel}</div>
            <div className="planner__options">
              {p.who.map((w) => (
                <button key={w} type="button" className="p-opt" aria-pressed={w === who} onClick={() => setWho(w)}>
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="planner__label">{p.interestsLabel}</div>
            <div className="planner__options">
              {p.interests.map((i) => (
                <button
                  key={i}
                  type="button"
                  className="p-opt p-opt--small"
                  aria-pressed={interests.includes(i)}
                  onClick={() => toggle(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="planner__preview" aria-live="polite">
        <div className="kicker">{p.previewLabel}</div>
        <div className="planner__preview-title">{title}</div>
        {plan.map((d) => (
          <div key={d.day} className="planner__day">
            <div className="planner__day-label">{d.day}</div>
            <div>{d.text}</div>
          </div>
        ))}
        <div className="card__fill" />
        <a href={p.ctaHref} className="btn btn--primary">
          {p.ctaLabel}
        </a>
        <div className="planner__note">{p.footnote}</div>
      </div>
    </div>
  );
}
