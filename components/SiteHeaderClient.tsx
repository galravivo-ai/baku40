"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PhotoInfo } from "@/lib/content";
import { useSaved } from "@/lib/saved";
import { Icon } from "./Icon";

export type HeaderNavItem = {
  label: string;
  href: string;
  links?: { label: string; sub: string; href: string }[];
  feature?: { title: string; text: string; href: string; photo: PhotoInfo };
};

function isActive(item: HeaderNavItem, pathname: string) {
  const hrefs = [item.href, ...(item.links?.map((l) => l.href) ?? [])];
  return hrefs.some((h) => h !== "/" && pathname.startsWith(h));
}

export function SiteHeaderClient({ nav, siteName }: { nav: HeaderNavItem[]; siteName: string }) {
  const pathname = usePathname() ?? "/";
  const { list } = useSaved();
  const [mega, setMega] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);

  useEffect(() => {
    setMega(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!mega && !drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(null);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega, drawer]);

  const activeMega = nav.find((n) => n.label === mega && n.links);

  return (
    <header className="site-header" onMouseLeave={() => setMega(null)}>
      <div className="site-header__bar">
        <button
          type="button"
          className="site-header__menu-btn"
          aria-label="תפריט"
          aria-expanded={drawer}
          onClick={() => setDrawer(true)}
        >
          <Icon name="menu" />
        </button>
        <Link href="/" className="site-header__logo" aria-label={`${siteName}, דף הבית`}>
          <img src="/assets/baku40-logo-skyblue.png" alt={siteName} width={113} height={32} />
        </Link>
        <nav aria-label="ניווט ראשי" className="site-nav">
          {nav.map((n) => (
            <div
              key={n.label}
              className="site-nav__item"
              onMouseEnter={() => setMega(n.links ? n.label : null)}
            >
              <Link
                href={n.href}
                className="site-nav__link"
                data-active={isActive(n, pathname) || mega === n.label}
                aria-current={isActive(n, pathname) ? "page" : undefined}
                aria-haspopup={n.links ? "true" : undefined}
                aria-expanded={n.links ? mega === n.label : undefined}
                onFocus={() => setMega(n.links ? n.label : null)}
              >
                {n.label}
              </Link>
            </div>
          ))}
        </nav>
        <div className="site-header__spacer" />
        <form action="/search/" role="search" className="site-header__search">
          <label className="visually-hidden" htmlFor="site-search">
            חיפוש באתר
          </label>
          <input id="site-search" name="q" type="search" placeholder="חיפוש" />
        </form>
        <Link href="/search/" className="site-header__search-btn" aria-label="חיפוש">
          <Icon name="search" />
        </Link>
        <Link href="/favorites/" className="site-header__trip">
          <span className="site-header__trip-label">הטיול שלי</span>
          <span className="count-pill" aria-label={`${list.length} מקומות שמורים`}>
            {list.length}
          </span>
        </Link>
      </div>

      {activeMega?.links && (
        <div className="mega">
          <div className="mega__inner">
            <div>
              <div className="mega__head">{activeMega.label}</div>
              <div className="mega__links">
                {activeMega.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="mega__link">
                    <span className="mega__link-label">{l.label}</span>
                    <span className="mega__link-sub">{l.sub}</span>
                  </Link>
                ))}
              </div>
            </div>
            {activeMega.feature && (
              <Link href={activeMega.feature.href} className="mega__feature">
                {activeMega.feature.photo ? (
                  <img className="mega__feature-img" src={activeMega.feature.photo.src} alt="" />
                ) : (
                  <div className="mega__feature-img card__media" aria-hidden="true" />
                )}
                <div className="mega__feature-kicker">מומלץ במערכת</div>
                <div className="mega__feature-title">{activeMega.feature.title}</div>
                <div className="mega__feature-text">{activeMega.feature.text}</div>
              </Link>
            )}
          </div>
        </div>
      )}

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <div className="drawer" role="dialog" aria-modal="true" aria-label="תפריט">
            <div className="drawer__top">
              <img src="/assets/baku40-logo-skyblue.png" alt={siteName} width={85} height={24} />
              <button type="button" className="drawer__close" aria-label="סגירה" onClick={() => setDrawer(false)}>
                <Icon name="close" />
              </button>
            </div>
            {nav.map((n) => (
              <div key={n.label} className="drawer__item">
                {n.links ? (
                  <>
                    <button
                      type="button"
                      className="drawer__row"
                      aria-expanded={openItem === n.label}
                      onClick={() => setOpenItem(openItem === n.label ? null : n.label)}
                    >
                      {n.label}
                      <span aria-hidden="true">{openItem === n.label ? "−" : "+"}</span>
                    </button>
                    {openItem === n.label && (
                      <div className="drawer__sub">
                        {n.links.map((l) => (
                          <Link key={l.href + l.label} href={l.href}>
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={n.href} className="drawer__row">
                    {n.label}
                    <span aria-hidden="true">‹</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
