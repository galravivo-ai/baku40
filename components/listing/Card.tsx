"use client";

import Image from "next/image";
import { useSaved } from "@/lib/saved";
import { Icon } from "../Icon";
import type { CardData } from "./types";
import { VerifyBadge } from "./VerifyBadge";

export function Card({ card, priority = false }: { card: CardData; priority?: boolean }) {
  const { has, toggle } = useSaved();
  const saved = has(card.id);
  return (
    <article className="card">
      <div className="card__media">
        {card.photo ? (
          <>
            <Image
              className="card__img"
              src={card.photo.src}
              alt={card.photo.alt}
              fill
              priority={priority}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 430px"
            />
            {card.photo.isRendering && <span className="photo-tag">הדמיה</span>}
            {card.photo.credit && <span className="photo-tag">צילום: {card.photo.credit}</span>}
          </>
        ) : (
          <div className="card__placeholder-icon" aria-hidden="true">
            <Icon name={card.icon || "image"} />
          </div>
        )}
        {card.badge && <div className="card__badge">{card.badge}</div>}
        <button
          type="button"
          className="save-btn"
          aria-pressed={saved}
          aria-label={saved ? `הסרת ${card.name} מהטיול שלי` : `שמירת ${card.name} בטיול שלי`}
          onClick={() => toggle(card.id)}
        >
          <Icon name={saved ? "bookmark" : "bookmark_border"} />
        </button>
      </div>
      <div className="card__body">
        {card.meta && <div className="card__meta">{card.meta}</div>}
        <h3 className="card__name">
          {card.href ? <a href={card.href}>{card.name}</a> : card.name}
          {card.nameEn && (
            <span className="card__name-en" dir="ltr">
              {card.nameEn}
            </span>
          )}
        </h3>
        <p className="card__text">{card.text}</p>
        <VerifyBadge kind={card.verifyKind} text={card.verify} />
        <div className="card__fill" />
        <div className="card__foot">
          <span className="card__foot-label">
            {card.icon && <Icon name={card.icon} />}
            <span>{card.foot}</span>
          </span>
          {card.booking ? (
            <a className="card__cta" href={card.booking.href} target="_blank" rel="sponsored nofollow noopener">
              {card.cta}
            </a>
          ) : (
            card.href && card.cta && <span className="card__cta">{card.cta}</span>
          )}
        </div>
        {card.booking && (
          <p className="card__disclosure">
            {card.booking.disclosure} <a href={card.booking.disclosureHref}>גילוי נאות</a>
          </p>
        )}
      </div>
    </article>
  );
}
