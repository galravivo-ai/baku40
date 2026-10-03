import { FaqSection } from "@/components/FaqSection";
import { orgRef, WEBSITE_ID_PATH } from "@/lib/seo";
import Link from "next/link";
import { AttractionsStrip } from "@/components/home/AttractionsStrip";
import { ReadyItineraries } from "@/components/home/ReadyItineraries";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { absoluteUrl, getAttractionsPage, getCollection, getHome, getItem, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getBakuTemperature } from "@/lib/weather";
import "./home-fixes.css";

const ITIN_ILLUS = [
  "assets/photos/itin-classic.png",
  "assets/photos/itin-family.png",
  "assets/photos/itin-summer.png",
  "assets/photos/itin-winter.png",
];

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

// Baku has no DST and Israel does, so the gap is +1 in summer and +2 in winter.
function bakuOffsetLabel(): string {
  const now = new Date();
  const hour = (tz: string) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now));
  const diff = (hour("Asia/Baku") - hour("Asia/Jerusalem") + 24) % 24;
  return diff === 1 ? "+1 שעה" : `+${diff} שעות`;
}

export default async function Home() {
  const site = getSite();
  const home = getHome();
  const attractionHref = new Map(getAttractionsPage().items.map((a) => [a.id, a.href]));
  const temperature = await getBakuTemperature();
  const utility = home.hero.utility
    .map((u) =>
      u.live === "weather" ? { ...u, value: temperature ?? "" } : u.live === "timezone" ? { ...u, value: bakuOffsetLabel() } : u,
    )
    .filter((u) => u.value);
  const [h1First, ...h1Rest] = home.hero.h1.split("\n");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": absoluteUrl("/"),
              url: absoluteUrl("/"),
              name: site.defaultTitle,
              description: site.defaultDescription,
              inLanguage: "he",
              isPartOf: { "@id": absoluteUrl(WEBSITE_ID_PATH) },
              about: { "@type": "City", name: "Baku", sameAs: "https://en.wikipedia.org/wiki/Baku" },
              publisher: orgRef(),
            },
          ],
        }}
      />

      {/* hero — design/Baku40 Home v2.dc.html */}
      <section className="hero2">
        <div className="hero2__media">
          <div className="hfix-hero hfix-hero--desktop">
            <Photo photo={home.hero.photo} alt={home.hero.photoAlt} sizes="(max-width: 700px) 16px, 100vw" priority showTags={false} />
          </div>
          <div className="hfix-hero hfix-hero--mobile">
            <Photo photo={home.hero.photo.replace("-desktop.", "-mobile.")} alt={home.hero.photoAlt} sizes="(max-width: 700px) 100vw, 16px" priority showTags={false} />
          </div>
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
              <Link href={u.href} data-live={u.live === "weather" ? "true" : undefined}>
                <Icon name={u.icon} className="facts2__icon" />
                <span className="facts2__text">
                  <span className="facts2__label">
                    {u.live === "weather" && <span className="facts2__dot" aria-hidden="true" />}
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

      {/* quick entry — Home v2 */}
      <nav className="quick2" aria-label={home.quickHead?.title ?? "כניסה מהירה"}>
        {home.quickHead && (
          <div className="quick2__head">
            <h2>{home.quickHead.title}</h2>
            <span>{home.quickHead.text}</span>
          </div>
        )}
        <div className="quick2__grid">
          {home.quick.map((q) => (
            <Link key={q.title} href={q.href} className="quick2__tile">
              {q.photo && <Photo photo={q.photo} alt="" sizes="(max-width: 700px) 50vw, 210px" showTags={false} />}
              <span className="quick2__shade" />
              <Icon name={q.icon} className="quick2__icon" />
              <span className="quick2__body">
                <strong>{q.title}</strong>
                <span>{q.sub}</span>
                <Icon name="arrow_back" className="quick2__arrow" />
              </span>
            </Link>
          ))}
        </div>
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

      {/* must see — Home v2 */}
      <section className="mosaic">
        <div className="mosaic__head">
          <div>
            {home.attractions.kicker && <div className="mosaic__kicker">{home.attractions.kicker}</div>}
            <h2>{home.attractions.title}</h2>
          </div>
          <Link href="/attractions/" className="mosaic__all">
            {home.attractions.linkLabel}
            <Icon name="arrow_back" />
          </Link>
        </div>
        <AttractionsStrip
          filters={home.attractions.filters}
          items={home.attractions.items.map((a, i) => ({
            id: a.id,
            name: a.name,
            meta: `${a.area} · ${a.dur}`,
            note: a.note,
            dur: a.dur,
            tags: a.tags,
            href: attractionHref.get(a.id) ?? "/attractions/",
            photo: a.photo ? (
              <Photo photo={a.photo} alt={a.photoAlt} sizes={i === 0 ? "(max-width: 700px) 270px, 640px" : "(max-width: 700px) 270px, 320px"} showTags={false} />
            ) : null,
          }))}
        />
      </section>

      {/* ready itineraries by days — night band (Home v2) */}
      <section className="ready-band">
        <ReadyItineraries
          p={home.planner}
          cards={getCollection("itineraries").items.map((i, idx) => ({
            slug: i.slug,
            days: Number(/^(\d+)/.exec(i.meta)?.[1] ?? 0),
            name: i.name,
            meta: i.meta,
            text: i.text,
            badge: i.badge || undefined,
            href: i.url ?? home.planner.href,
            photo: <Photo photo={ITIN_ILLUS[idx % ITIN_ILLUS.length]} alt="" sizes="(max-width: 700px) 220px, 320px" icon="route" />,
          }))}
        />
      </section>

      {/* recommended hotels — Home v2 */}
      <section className="hotels2">
        <div className="hotels2__inner">
          <div className="hotels2__head">
            <div>
              {home.hotels.kicker && <div className="hotels2__kicker">{home.hotels.kicker}</div>}
              <h2 className="hotels2__title">{home.hotels.title}</h2>
            </div>
            <Link href="/hotels/" className="hotels2__all">
              {home.hotels.linkLabel.replace("{n}", String(getCollection("hotels").items.length))}
              <Icon name="arrow_back" />
            </Link>
          </div>
          <div className="hotels2__grid">
            {home.hotels.items.map((h) => {
              const item = getItem("hotels", h.slug);
              if (!item) return null;
              const alt = item.nameHe ? `${item.nameHe} (${item.name})` : item.name;
              return (
                <Link key={h.slug} href={item.url ?? "/hotels/"} className="hotel2">
                  <div className="hotel2__media">
                    <Photo photo={h.photo} alt={h.photoAlt || alt} sizes="(max-width: 700px) 100vw, 410px" icon="hotel" />
                  </div>
                  <div className="hotel2__line">
                    <span className="hotel2__stars" aria-label={`${h.stars.length} כוכבים`}>
                      {h.stars}
                    </span>
                    <span>{h.area}</span>
                  </div>
                  <h3 className="hotel2__name hfix-name">
                    <span className="hfix-name__he">{item.nameHe ?? item.name}</span>
                    {item.nameHe && (
                      <span className="hfix-name__en" dir="ltr">
                        {item.name}
                      </span>
                    )}
                  </h3>
                  <p className="hotel2__text">{h.text}</p>
                  <ul className="hotel2__tags">
                    {h.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* food — Home v2 (29.9 redesign) */}
      <section className="hfood">
        <div className="hfood__panel">
          <div className="hfood__side">
            {home.food.kicker && <div className="hfood__kicker">{home.food.kicker}</div>}
            <h2>{home.food.title}</h2>
            <p>{home.food.text}</p>
            <nav className="hfood__links" aria-label="מדריכי אוכל">
              {home.food.links.map((l) => (
                <Link key={l.label} href={l.href}>
                  <Icon name={l.icon} />
                  <span>{l.label}</span>
                  <span className="hfood__chev" aria-hidden="true">←</span>
                </Link>
              ))}
            </nav>
            <Link href={home.food.ctaHref} className="hfood__cta">
              {home.food.ctaLabel} <span aria-hidden="true">←</span>
            </Link>
          </div>
          <div className="hfood__cards">
            {home.food.items.map((r) => {
              const item = getItem("restaurants", r.slug);
              if (!item) return null;
              return (
                <Link key={r.slug} href={`/restaurants/?q=${encodeURIComponent(item.name)}`} className="hfood__card">
                  <Photo photo={r.photo} alt={r.photoAlt} sizes="(max-width: 700px) 85vw, 300px" showTags={false} icon="restaurant" />
                  <span className="hfood__shade" />
                  <span className="hfood__top">
                    <span className="hfood__price">מחיר: {r.price}</span>
                    {r.pick && <span className="hfood__pick">בחירת המערכת</span>}
                  </span>
                  <span className="hfood__body">
                    <span className="hfood__meta">
                      {r.cuisine} · {r.area}
                    </span>
                    <strong>{item.name}</strong>
                    <span className="hfood__note">{r.note}</span>
                    <span className="hfood__foot">
                      <span>לפרטים</span>
                      <span className="hfood__go" aria-hidden="true">←</span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* real estate — photo band (Home v2) */}
      <section className="re3">
        {home.realEstate.bandPhoto && (
          <Photo photo={home.realEstate.bandPhoto} alt="" sizes="100vw" showTags={false} />
        )}
        <div className="re3__shade" />
        <div className="re3__inner">
          <div className="re3__text">
            <div className="re3__kicker">{home.realEstate.kicker}</div>
            <h2>{home.realEstate.title}</h2>
            <p>{home.realEstate.text}</p>
            <div className="re3__links">
              {home.realEstate.links.map((l) => (
                <Link key={l} href={home.realEstate.linksHref}>
                  {l}
                </Link>
              ))}
            </div>
            <Link href={home.realEstate.guideHref} className="re3__cta">
              {home.realEstate.guideLabel}
            </Link>
          </div>
          <div className="re3__projects">
            {home.realEstate.projects.map((p) => (
              <Link key={p.name} href={p.href} className="re3__project">
                <div className="re3__media">
                  <Photo photo={p.photo} alt={`${p.name}, ${p.badge}`} sizes="(max-width: 700px) 120px, 380px" showTags={false} />
                  <span className="re3__badge">{p.badge}</span>
                </div>
                <div className="re3__body">
                  <strong>{p.name}</strong>
                  <span>{p.text}</span>
                  <span className="re3__meta">{p.meta}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* questions and answers, with FAQPage markup */}
      <div className="container home-faq">
        <FaqSection items={home.faq} title={home.faqTitle} url="/" />
      </div>
    </>
  );
}
