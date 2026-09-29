import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { getTravelTopics } from "@/lib/content";
import type { TravelTopic } from "@/lib/schema";
import { breadcrumbJsonLd, MIN_INDEXABLE_WORDS, pageMetadata, type Crumb } from "@/lib/seo";

// Travel-info topic page — design/Baku40 Travel Info.dc.html, template 7b
// (visa, currency, SIM, transportation, safety). Content:
// content/pages/travel-info/{slug}.json.

export const dynamicParams = false;

export function generateStaticParams() {
  return getTravelTopics().map((t) => ({ topic: t.slug }));
}

type Props = { params: Promise<{ topic: string }> };

function load(slug: string) {
  const topic = getTravelTopics().find((t) => t.slug === slug);
  if (!topic) notFound();
  return topic;
}

const url = (t: TravelTopic) => `/travel-info/${t.slug}/`;

function wordCount(t: TravelTopic) {
  return [t.answer, ...t.checks, t.detailText, ...t.cards.map((c) => `${c.title} ${c.text}`), ...t.faq.map((f) => `${f.q} ${f.a}`)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function generateMetadata({ params }: Props) {
  const t = load((await params).topic);
  return pageMetadata({
    path: url(t),
    title: t.seo.metaTitle,
    fallbackTitle: t.h1,
    description: t.seo.metaDescription,
    fallbackDescription: t.answer,
    robots: wordCount(t) < MIN_INDEXABLE_WORDS ? "noindex,follow" : "index,follow",
  });
}

const RELATED = [
  { title: "כל המידע למטייל", meta: "עמוד אב", href: "/travel-info/" },
  { title: "מזג אוויר בבאקו", meta: "לפי חודש", href: "/weather/september/" },
  { title: "מסלולים מוכנים", meta: "יום עד שבוע", href: "/itineraries/" },
];

export default async function TravelTopicPage({ params }: Props) {
  const t = load((await params).topic);
  const topics = getTravelTopics();
  const crumbs: Crumb[] = [
    { label: "דף הבית", href: "/" },
    { label: "מידע למטייל", href: "/travel-info/" },
    { label: t.title, href: url(t) },
  ];
  const faqLd = {
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbJsonLd(crumbs), faqLd] }} />
      <div className="container topic">
        <Breadcrumbs crumbs={crumbs} />
        <div className="topic__layout">
          <nav className="topic__side" aria-label="נושאים במידע למטייל">
            <div className="topic__kicker">נושאים במידע למטייל</div>
            {topics.map((o) => (
              <Link key={o.slug} href={url(o)} aria-current={o.slug === t.slug ? "page" : undefined}>
                <Icon name={o.icon} />
                {o.title}
              </Link>
            ))}
          </nav>

          <article className="topic__main">
            <h1 className="topic__h1">{t.h1}</h1>
            <div className="topic__card">
              <div className="topic__answer">
                <div>התשובה הקצרה</div>
                <p>{t.answer}</p>
              </div>

              <h2>{t.checksTitle}</h2>
              <ul className="topic__checks">
                {t.checks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>

              <h2>{t.detailTitle}</h2>
              <p className="topic__text">{t.detailText}</p>
              <div className="topic__cards">
                {t.cards.map((c) => (
                  <div key={c.title}>
                    <div className="topic__card-head">
                      <Icon name={c.icon} />
                      <h3>{c.title}</h3>
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="topic__source">
                <Icon name="link" />
                <p>{t.sourceNote}</p>
                {t.sourceHref && (
                  <a href={t.sourceHref} target="_blank" rel="noopener">
                    למקור
                  </a>
                )}
              </div>

              <h2>שאלות נפוצות</h2>
              <div className="faq topic__faq">
                {t.faq.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>

              <div className="topic__sources">
                <div>מקורות</div>
                <ul>
                  {t.sources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p>
                  <span aria-hidden="true" />
                  {t.verified}
                </p>
              </div>
            </div>
          </article>

          <aside className="topic__aside">
            <div className="topic__facts">
              <div className="topic__kicker">מידע מהיר</div>
              <dl>
                {t.facts.map((f) => (
                  <div key={f.k}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <nav className="topic__related" aria-label="להמשיך מכאן">
              <div className="topic__kicker">להמשיך מכאן</div>
              {RELATED.map((r) => (
                <Link key={r.href} href={r.href}>
                  <strong>{r.title}</strong>
                  <span>{r.meta}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
}
