import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link href="/" aria-label={`${site.name}, דף הבית`}>
            <Image className="site-footer__logo" src="/assets/baku40-logo.png" alt={site.name} width={106} height={30} />
          </Link>
          <p>{site.footerTagline}</p>
        </div>
        {site.footerColumns.map((col) => (
          <nav key={col.head} className="site-footer__col" aria-label={col.head}>
            <h2>{col.head}</h2>
            <ul>
              {col.items.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="site-footer__bottom">
        {site.footer.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <span className="site-footer__copy">{site.copyright}</span>
      </div>
    </footer>
  );
}
