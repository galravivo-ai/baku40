import Image from "next/image";
import Link from "next/link";
import { FooterColumns } from "@/components/FooterColumns";
import { CookieSettingsLink } from "@/components/consent/CookieSettingsLink";
import { getSite } from "@/lib/content";

export function SiteFooter() {
  const site = getSite();
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link href="/" aria-label={`${site.name}, דף הבית`}>
            <Image className="site-footer__logo" src="/baku40-logo-white-text.png" alt={site.name} width={113} height={32} />
          </Link>
          <p>{site.footerTagline}</p>
        </div>
        <FooterColumns columns={site.footerColumns} />
      </div>
      <div className="site-footer__bottom">
        {site.footer.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <CookieSettingsLink />
        <span className="site-footer__copy">{site.copyright}</span>
      </div>
    </footer>
  );
}
