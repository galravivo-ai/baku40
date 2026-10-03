import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, type FaqItem } from "@/lib/seo";

// Visible questions and answers plus the matching FAQPage markup, so the
// schema always describes text that is on the page.

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq2__list">
      {items.map((f, i) => (
        <details key={f.q} className="faq2__item" open={i === 0}>
          <summary>
            <span className="faq2__q">{f.q}</span>
            <span className="faq2__icon" aria-hidden="true">
              +
            </span>
          </summary>
          <p className="faq2__a">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({
  items,
  title = "שאלות נפוצות",
  url,
  variant = "plain",
  kicker = "שאלות ותשובות",
  intro,
  cta,
}: {
  items: FaqItem[];
  title?: string;
  url?: string;
  variant?: "plain" | "panel";
  kicker?: string;
  intro?: string;
  cta?: { label: string; href: string };
}) {
  if (!items.length) return null;
  return (
    <section className={`faq2 faq2--${variant}`} aria-labelledby="faq-title">
      <JsonLd data={{ "@context": "https://schema.org", ...faqJsonLd(items, url) }} />
      <div className="faq2__side">
        <div className="faq2__kicker">{kicker}</div>
        <h2 id="faq-title" className="faq2__title">
          {title}
        </h2>
        {intro && <p className="faq2__intro">{intro}</p>}
        {cta && (
          <Link href={cta.href} className="faq2__cta">
            {cta.label} <span aria-hidden="true">←</span>
          </Link>
        )}
      </div>
      <FaqList items={items} />
    </section>
  );
}
