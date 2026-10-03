import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, type FaqItem } from "@/lib/seo";

// Visible questions and answers plus the matching FAQPage markup, so the
// schema always describes text that is on the page.
export function FaqSection({
  items,
  title = "שאלות נפוצות",
  url,
  className = "",
}: {
  items: FaqItem[];
  title?: string;
  url?: string;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <section className={`faq-section ${className}`.trim()} aria-labelledby="faq-title">
      <JsonLd data={{ "@context": "https://schema.org", ...faqJsonLd(items, url) }} />
      <h2 id="faq-title" className="section-title">
        {title}
      </h2>
      <div className="faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
