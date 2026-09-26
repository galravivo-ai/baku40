import Link from "next/link";
import { getAllCollections, getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  const collections = getAllCollections();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link href="/" aria-label={`${site.name}, דף הבית`}>
          <img className="site-footer__logo" src="/assets/baku40-logo.png" alt={site.name} width={85} height={24} />
        </Link>
        {site.footer.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <span className="site-footer__copy">{site.copyright}</span>
      </div>
      <nav aria-label="כל האוספים" className="site-footer__inner site-footer__collections">
        {collections.map((c) => (
          <Link key={c.url} href={c.url}>
            {c.h1}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
