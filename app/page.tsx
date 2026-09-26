import Link from "next/link";
import { AttractionsStrip } from "@/components/home/AttractionsStrip";
import { Planner } from "@/components/home/Planner";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { bookingHref } from "@/lib/booking";
import { absoluteUrl, getHome, getItem, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getBakuTemperature } from "@/lib/weather";

// Home page — design/Baku40 Home.dc.html (1a). All texts: content/pages/home.json.

export const revalidate = 1800; // live weather badge

export function generateMetadata() {
  const site = getSite();
  const page = site.staticPages.find((p) => p.url === "/");
  return pageMetadata({
    path: "/",
    title: page?.metaTitle,
    fallbackTitle: site.defaultTitle,
    description: page?.metaDescription,
    fallbackDescription: site.defaultDescription,
    robots: page?.robots,
  });
}

function SectionHead({ title, text, link }: { title: string; text?: string; link?: { label: string; href: string } }) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">{title}</h2>
        {text && <p className="section-text">{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="section-link">
          {link.label}
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const site = getSite();
  const home = getHome();
  const temperature = await getBakuTemperature();
  const utility = home.hero.utility
    .map((u) => (u.live === "weather" ? { ...u, value: temperature ?? "" } : u))
    .filter((u) => u.value);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: site.name,
              url: absoluteUrl("/"),
              inLanguage: "he",
              potentialAction: {
                "@type": "SearchAction",
                target: `${absoluteUrl("/search/")}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            site.organization,
          ],
        }}
      />

      {/* hero */}
      <section className="home-hero">
        <Photo photo={home.hero.photo} alt={home.hero.photoAlt} sizes="100vw" priority />
        <div className="home-hero__shade" />
        <div className="home-hero__body">
          <div className="kicker kicker--light">{home.hero.kicker}</div>
          <h1 className="home-hero__h1">
            {home.hero.h1.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className="home-hero__intro">{home.hero.intro}</p>
          <form action="/search/" role="search" className="home-search">
            <label className="visually-hidden" htmlFor="home-q">
              {home.hero.searchPlaceholder}
            </label>
            <Icon name="search" />
            <input id="home-q" name="q" type="search" placeholder={home.hero.searchPlaceholder} />
            <button type="submit" className="btn btn--primary">
              חיפוש
            </button>
          </form>
          <div className="home-hero__choices">
            {home.hero.choices.map((c) => (
              <Link key={c.title} href={c.href} className="ghost-pill">
                {c.title}
              </Link>
            ))}
          </div>
        </div>
        <dl className="home-utility">
          {utility.map((u) => (
            <div key={u.label}>
              <dt>{u.label}</dt>
              <dd>{u.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* quick entry */}
      <nav className="container home-section home-quick" aria-label="כניסה מהירה">
        {home.quick.map((q) => (
          <Link key={q.title} href={q.href} className="quick-card">
            <Icon name={q.icon} className="quick-card__icon" />
            <span className="quick-card__title">{q.title}</span>
            <span className="quick-card__sub">{q.sub}</span>
          </Link>
        ))}
      </nav>

      {/* first time */}
      <section className="container home-section">
        <div className="first-time">
          <div className="first-time__body">
            <div className="kicker">{home.firstTime.kicker}</div>
            <h2 className="section-title">{home.firstTime.title}</h2>
            <p className="section-text section-text--lg">{home.firstTime.text}</p>
            <div className="first-time__grid">
              {home.firstTime.items.map((f) => (
                <Link key={f.num} href={f.href} className="first-time__item">
                  <Icon name={f.icon} className="first-time__icon" />
                  <span className="first-time__label">
                    <strong>{f.title}</strong>
                    <span>{f.sub}</span>
                  </span>
                  <span className="first-time__num">{f.num}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="first-time__photo">
            <Photo photo={home.firstTime.photo} alt={home.firstTime.photoAlt} sizes="(max-width: 900px) 100vw, 560px" />
          </div>
        </div>
      </section>

      {/* must see */}
      <section className="container home-section">
        <div className="tinted-panel">
          <SectionHead
            title={home.attractions.title}
            text={home.attractions.text}
            link={{ label: home.attractions.linkLabel, href: "/attractions/" }}
          />
          <AttractionsStrip
            filters={home.attractions.filters}
            items={home.attractions.items.map((a) => ({
              id: a.id,
              name: a.name,
              meta: `${a.area} · ${a.dur}`,
              note: a.note,
              dur: a.dur,
              tags: a.tags,
              href: "/attractions/",
              photo: <Photo photo={a.photo} alt={a.photoAlt} sizes="(max-width: 700px) 85vw, 420px" icon="castle" />,
            }))}
          />
        </div>
      </section>

      {/* planner */}
      <section className="container home-section">
        <Planner p={home.planner} />
      </section>

      {/* itineraries */}
      <section className="container home-section">
        <div className="tinted-panel">
          <SectionHead title={home.itineraries.title} />
          <div className="grid-4">
            {home.itineraries.items.map((i) => (
              <Link key={i.title} href={home.itineraries.href} className="itin-card">
                <span className="itin-card__days">{i.days}</span>
                <span className="itin-card__title">{i.title}</span>
                <span className="itin-card__text">{i.text}</span>
                <span className="itin-card__meta">{i.meta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* recommended hotels */}
      <section className="container home-section">
        <SectionHead
          title={home.hotels.title}
          text={home.hotels.text}
          link={{ label: home.hotels.linkLabel, href: "/hotels/" }}
        />
        <div className="grid-3">
          {home.hotels.items.map((h) => {
            const item = getItem("hotels", h.slug);
            if (!item) return null;
            return (
              <article key={h.slug} className="card">
                <div className="card__media card__media--tall">
                  <Photo photo={h.photo} alt={h.photoAlt} sizes="(max-width: 700px) 100vw, 430px" icon="hotel" />
                </div>
                <div className="card__body">
                  <div className="hotel-line">
                    <span className="hotel-line__stars" aria-label={`${h.stars.length} כוכבים`}>
                      {h.stars}
                    </span>
                    <span>{h.area}</span>
                  </div>
                  <h3 className="card__name">
                    <Link href={item.url ?? "/hotels/"}>{item.name}</Link>
                  </h3>
                  <p className="card__text">{h.text}</p>
                  <div className="card__fill" />
                  <ul className="tag-list">
                    {h.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <div className="card__foot">
                    <span className="card__foot-label">
                      <Icon name="directions_walk" />
                      <span>{h.walk}</span>
                    </span>
                    <a className="card__cta" href={bookingHref(item)} target="_blank" rel="sponsored nofollow noopener">
                      {item.cta}
                    </a>
                  </div>
                  <p className="card__disclosure">
                    {site.affiliateDisclosureShort} <Link href="/affiliate-disclosure/">גילוי נאות</Link>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* food */}
      <section className="container home-section">
        <div className="food-panel">
          <div>
            <h2 className="section-title section-title--light">{home.food.title}</h2>
            <p className="section-text section-text--light">{home.food.text}</p>
            <div className="grid-3 grid-3--tight">
              {home.food.items.map((r) => {
                const item = getItem("restaurants", r.slug);
                if (!item) return null;
                return (
                  <Link key={r.slug} href="/restaurants/" className="food-card">
                    <div className="food-card__media">
                      <Photo photo={r.photo} alt={r.photoAlt} sizes="(max-width: 700px) 100vw, 280px" icon={r.icon} />
                    </div>
                    <div className="food-card__body">
                      <span className="food-card__name">
                        <Icon name={r.icon} />
                        {item.name}
                      </span>
                      <span className="card__meta">{r.meta}</span>
                      <span className="food-card__note">{r.note}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
          <nav className="food-links" aria-label={home.food.linksTitle}>
            <div className="kicker">{home.food.linksTitle}</div>
            {home.food.links.map((l) => (
              <Link key={l.label} href={l.href}>
                <Icon name="chevron_left" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* practical */}
      <section className="container home-section">
        <div className="practical-panel">
          <div className="section-head">
            <h2 className="section-title section-title--md">{home.practical.title}</h2>
            <div className="practical-panel__meta">
              <span>{home.practical.checked}</span>
              <Link href={home.practical.href} className="section-link">
                {home.practical.linkLabel}
              </Link>
            </div>
          </div>
          <div className="grid-3 grid-3--tight">
            {home.practical.items.map((p) => (
              <Link key={p.title} href={home.practical.href} className="practical-card">
                <span className="practical-card__title">
                  <Icon name={p.icon} />
                  {p.title}
                </span>
                <span>{p.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* real estate */}
      <section className="container home-section">
        <div className="re-panel">
          <div>
            <div className="kicker">{home.realEstate.kicker}</div>
            <h2 className="section-title section-title--md">{home.realEstate.title}</h2>
            <p className="section-text section-text--lg">{home.realEstate.text}</p>
            <div className="chip-row">
              {home.realEstate.links.map((l) => (
                <Link key={l} href={home.realEstate.linksHref} className="link-chip">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div className="re-projects">
            {home.realEstate.projects.map((p) => (
              <Link key={p.name} href={p.href} className="re-project">
                <div className="re-project__media">
                  <Photo photo={p.photo} alt={`${p.name}, ${p.badge}`} sizes="120px" showTags={false} />
                  <span className="re-project__badge">{p.badge}</span>
                </div>
                <div className="re-project__body">
                  <strong>{p.name}</strong>
                  <span>{p.text}</span>
                  <span className="card__meta">{p.meta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* magazine */}
      <section className="container home-section home-section--last">
        <div className="tinted-panel">
          <SectionHead title={home.magazine.title} />
          <div className="grid-3">
            {home.magazine.items.map((m) => (
              <Link key={m.title} href={home.magazine.href} className="mag-card">
                <div className="mag-card__media">
                  <Photo photo={m.photo} alt="" sizes="(max-width: 700px) 100vw, 400px" />
                </div>
                <span className="mag-card__cat">{m.cat}</span>
                <span className="mag-card__title">{m.title}</span>
                <span className="mag-card__text">{m.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
