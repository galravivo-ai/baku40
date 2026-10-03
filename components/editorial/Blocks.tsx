import { FaqList } from "@/components/FaqSection";
import Link from "next/link";
import { getAttractionsPage, getCollection } from "@/lib/content";
import type { Block } from "@/lib/schema";
import { Photo } from "../Photo";


function A({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return href.startsWith("http") ? (
    <a href={href} className={className} target="_blank" rel="noopener">
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Renders the blocks of an editorial page (content/pages/editorial/*.json). */
export function Blocks({ blocks }: { blocks: Block[] }) {
  let h2 = 0;
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={`s${h2++}`} className="ed-h2">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="ed-h3">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="ed-p">
                {b.text}
              </p>
            );
          case "note":
            return (
              <p key={i} className="ed-note">
                {b.text}
              </p>
            );
          case "kicker":
            return (
              <div key={i} className="kicker ed-kicker">
                {b.text}
              </div>
            );
          case "callout":
            return (
              <aside key={i} className="info-box ed-block">
                <h3 className="info-box__title">{b.title}</h3>
                <p className="info-box__text">{b.text}</p>
              </aside>
            );
          case "list":
            return (
              <ul key={i} className="ed-list">
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            );
          case "link":
            return (
              <p key={i} className="ed-link">
                <A href={b.href}>{b.label}</A>
              </p>
            );
          case "image":
            return (
              <div key={i} className="ed-image">
                <Photo photo={b.photo} alt={b.alt} sizes="(max-width: 900px) 100vw, 820px" />
              </div>
            );
          case "stats":
            return (
              <div key={i} className="ed-stats">
                {b.items.map((s) => (
                  <div key={s.label + s.value}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            );
          case "facts":
            return (
              <dl key={i} className="ed-facts">
                {b.items.map((f) => (
                  <div key={f.k + f.v}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            );
          case "cards":
            return (
              <div key={i} className="ed-cards">
                {b.items.map((c) => {
                  const inner = (
                    <>
                      <strong>{c.title}</strong>
                      <span>{c.text}</span>
                      {c.note && <em>{c.note}</em>}
                    </>
                  );
                  return c.href ? (
                    <A key={c.title} href={c.href} className="ed-card ed-card--link">
                      {inner}
                    </A>
                  ) : (
                    <div key={c.title} className="ed-card">
                      {inner}
                    </div>
                  );
                })}
              </div>
            );
          case "photoCards":
            return (
              <div key={i} className="ed-photo-cards">
                {b.items.map((c) => (
                  <article key={c.title} className="ed-pcard">
                    <div className="ed-pcard__media">
                      <Photo photo={c.photo} alt={c.alt || c.title} sizes="(max-width: 700px) 100vw, 400px" />
                      {c.badge && <span className="ed-pcard__badge">{c.badge}</span>}
                    </div>
                    <div className="ed-pcard__body">
                      <div className="ed-pcard__title">
                        <strong>{c.href ? <A href={c.href}>{c.title}</A> : c.title}</strong>
                        {c.tag && <span className="ed-pcard__tag">{c.tag}</span>}
                      </div>
                      {c.text && <p>{c.text}</p>}
                      {c.facts && (
                        <dl>
                          {c.facts.map((f) => (
                            <div key={f.k}>
                              <dt>{f.k}</dt>
                              <dd>{f.v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {c.note && <span className="ed-pcard__note">{c.note}</span>}
                    </div>
                  </article>
                ))}
              </div>
            );
          case "steps":
            return (
              <ol key={i} className="ed-steps">
                {b.items.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    {s.text && <span>{s.text}</span>}
                  </li>
                ))}
              </ol>
            );
          case "liveStats": {
            const stats = [
              { value: getAttractionsPage().items.length, label: "אטרקציות במאגר", href: "/attractions/" },
              { value: getCollection("restaurants").items.length, label: "מסעדות", href: "/restaurants/" },
              { value: getCollection("hotels").items.length, label: "מלונות", href: "/hotels/" },
              { value: getCollection("itineraries").items.length, label: "מסלולים מוכנים", href: "/itineraries/" },
            ];
            return (
              <div key={i} className="ed-stats">
                {stats.map((s) => (
                  <Link key={s.label} href={s.href}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </Link>
                ))}
              </div>
            );
          }
          case "stops":
            return (
              <ol key={i} className="ed-stops">
                {b.items.map((s) => (
                  <li key={s.time + s.name} className={s.optional ? "ed-stop ed-stop--optional" : "ed-stop"}>
                    <span className="ed-stop__time">{s.time}</span>
                    <div className="ed-stop__card">
                      {s.photo && (
                        <div className="ed-stop__media">
                          <Photo photo={s.photo} alt={s.alt ?? s.name} sizes="(max-width: 700px) 100vw, 700px" />
                        </div>
                      )}
                      <div className="ed-stop__body">
                        <strong>
                          {s.name}
                          {s.optional && <span className="ed-pcard__tag">אופציונלי</span>}
                        </strong>
                        <span className="ed-stop__meta">{s.meta}</span>
                        <p>{s.text}</p>
                        {s.tip && <p className="ed-stop__tip">{s.tip}</p>}
                      </div>
                    </div>
                    {s.move && <span className="ed-stop__move">{s.move}</span>}
                  </li>
                ))}
              </ol>
            );
          case "faq":
            return (
              <div key={i} className="ed-block">
                <FaqList items={b.items} />
              </div>
            );
          case "sources":
            return (
              <div key={i} className="ed-sources">
                <div className="kicker">מקורות</div>
                <ul>
                  {b.items.map((s) => (
                    <li key={s.label}>{s.href ? <A href={s.href}>{s.label}</A> : s.label}</li>
                  ))}
                </ul>
              </div>
            );
          case "table":
            return (
              <div key={i} className="ed-table-wrap">
                <table className="ed-table">
                  <thead>
                    <tr>
                      {b.head.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri}>
                        {r.map((c, ci) => (ci === 0 ? <th key={ci} scope="row">{c}</th> : <td key={ci}>{c}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </>
  );
}
