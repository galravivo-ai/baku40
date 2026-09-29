import Link from "next/link";
import { AttractionsStrip } from "@/components/home/AttractionsStrip";
import { ReadyItineraries } from "@/components/home/ReadyItineraries";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { bookingHref } from "@/lib/booking";
import { absoluteUrl, getAttractionsPage, getCollection, getHome, getItem, getSite } from "@/lib/content";
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
  const attractionHref = new Map(getAttractionsPage().items.map((a) => [a.id, a.href]));
  const temperature = await getBakuTemperature();
  const utility = home.hero.utility
    .map((u) => (u.live === "weather" ? { ...u, value: temperature ?? "" } : u))
    .filter((u) => u.value);
  const [h1First, ...h1Rest] = home.hero.h1.split("\n");

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

      {/* hero — design/Baku40 Home v2.dc.html */}
      <section className="hero2">
        <div className="hero2__media">
          <Photo photo={home.hero.photo} alt={home.hero.photoAlt} sizes="100vw" priority showTags={false} />
          <div className="hero2__shade" />
        </div>
        <div className="hero2__body">
          <div className="hero2__text">
            <div className="hero2__kicker">
              <span aria-hidden="true" />
              {home.hero.kicker}
            </div>
            <h1 className="hero2__h1">
              {h1First}
              {h1Rest.map((line) => (
                <span key={line}>
                  <br />
                  {line}
                </span>
              ))}
            </h1>
            <p className="hero2__intro">
              <span className="hero2__intro-full">{home.hero.intro}</span>
              {home.hero.introMobile && <span className="hero2__intro-short">{home.hero.introMobile}</span>}
            </p>
          </div>
          <div className="hero2__side">
            <form action="/search/" role="search" className="hero2__search">
              <label className="visually-hidden" htmlFor="home-q">
                {home.hero.searchPlaceholder}
              </label>
              <Icon name="search" />
              <input id="home-q" name="q" type="search" placeholder={home.hero.searchPlaceholder} />
              <button type="submit">חיפוש</button>
            </form>
            <div className="hero2__choices">
              {home.hero.choices.map((c) => (
                <Link key={c.title} href={c.href}>
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* facts strip, overlapping the hero on desktop */}
      <div className="facts2">
        <ul className="facts2__card">
          {utility.map((u) => (
            <li key={u.label} className={u.mobile ? "facts2__item facts2__item--mobile" : "facts2__item"}>
              <Link href={u.href} data-live={u.live ? "true" : undefined}>
                <Icon name={u.icon} className="facts2__icon" />
                <span className="facts2__text">
                  <span className="facts2__label">
                    {u.live && <span className="facts2__dot" aria-hidden="true" />}
                    <span className="facts2__label-full">{u.label}</span>
                    <span className="facts2__label-short">{u.labelMobile ?? u.label}</span>
                  </span>
                  <span className="facts2__value">{u.value}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

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

      {/* first time — Home v2 */}
      <section className="first2">
        <div className="first2__body">
          <div className="first2__kicker">
            <span>{home.firstTime.kicker}</span>
            {home.firstTime.badge && (
              <span className="first2__badge">
                <span aria-hidden="true" />
                {home.firstTime.badge}
              </span>
            )}
          </div>
          <h2 className="first2__title">{home.firstTime.title}</h2>
          <p className="first2__text">{home.firstTime.text}</p>
          <div className="first2__list">
            {home.firstTime.items.map((f) => (
              <Link key={f.num} href={f.href} className="first2__item">
                <span className="first2__num">{f.num}</span>
                <span>
                  <strong>{f.title}</strong>
                  <span>{f.sub}</span>
                </span>
                <Icon name="arrow_back" className="first2__arrow" />
              </Link>
            ))}
          </div>
          {home.firstTime.ctaHref && (
            <Link href={home.firstTime.ctaHref} className="first2__cta">
              {home.firstTime.ctaLabel}
              <Icon name="arrow_back" />
            </Link>
          )}
        </div>
        <div className="first2__photo">
          <Photo photo={home.firstTime.photo} alt={home.firstTime.photoAlt} sizes="(max-width: 900px) 100vw, 520px" showTags={false} />
          <div className="first2__shade" />
          {home.firstTime.tipText && (
            <div className="first2__tip">
              <div>{home.firstTime.tipTitle}</div>
              <p>{home.firstTime.tipText}</p>
            </div>
          )}
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
              href: attractionHref.get(a.id) ?? "/attractions/",
              photo: <Photo photo={a.photo} alt={a.photoAlt} sizes="(max-width: 700px) 85vw, 420px" icon="castle" />,
            }))}
          />
        </div>
      </section>

      {/* ready itineraries by days */}
      <section className="container home-section">
        <ReadyItineraries
          p={home.planner}
          cards={getCollection("itineraries").items.map((i) => ({
            slug: i.slug,
            days: Number(/^(\d+)/.exec(i.meta)?.[1] ?? 0),
            name: i.name,
            meta: i.meta,
            text: i.text,
            badge: i.badge || undefined,
            href: i.url ?? home.planner.href,
            photo: <Photo photo={i.photo} alt={i.photoAlt} note={i.photoNote} sizes="(max-width: 700px) 262px, 320px" icon="route" />,
          }))}
        />
      </section>

      {/* real estate */}
      <section className="container home-section">
        <div className="re2">
          <div className="re2__top">
            <div className="re2__intro">
              <div className="kicker kicker--on-dark">{home.realEstate.kicker}</div>
              <h2 className="re2__title">{home.realEstate.title}</h2>
              <p className="re2__text">{home.realEstate.text}</p>
            </div>
            <Link href={home.realEstate.guideHref} className="re2__guide">
              <span>{home.realEstate.guideLabel}</span>
              <Icon name="arrow_back" />
            </Link>
          </div>
          <div className="re2__projects">
            {home.realEstate.projects.map((p) => (
              <Link key={p.name} href={p.href} className="re2__project">
                <Photo photo={p.photo} alt={`${p.name}, ${p.badge}`} sizes="(max-width: 700px) 280px, 620px" showTags={false} />
                <span className="re2__shade" />
                <span className="re2__badge">{p.badge}</span>
                <span className="re2__body">
                  <strong>{p.name}</strong>
                  <span>{p.text}</span>
                  <span className="re2__foot">
                    <span className="re2__meta">{p.meta}</span>
                    <span className="re2__cta">לפרויקט ←</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="re2__links">
            <span>{home.realEstate.linksTitle}</span>
            {home.realEstate.links.map((l) => (
              <Link key={l} href={home.realEstate.linksHref}>
                {l}
              </Link>
            ))}
          </div>
          <Link href={home.realEstate.guideHref} className="re2__guide re2__guide--mobile">
            <span>{home.realEstate.guideLabel}</span>
            <Icon name="arrow_back" />
          </Link>
        </div>
      </section>

      {/* recommended hotels */}
      <section className="container home-section">
        <SectionHead
          title={home.hotels.title}
          text={home.hotels.text}
          link={{ label: home.hotels.linkLabel, href: "/hotels/" }}
        />
        <div className="grid-3 home-hotels">
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
