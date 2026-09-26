import { getHome, getPhoto, getSite } from "@/lib/content";
import { SiteHeaderClient, type HeaderNavItem } from "./SiteHeaderClient";

export function SiteHeader() {
  const site = getSite();
  const nav: HeaderNavItem[] = site.nav.map((n) => ({
    label: n.label,
    href: n.href,
    links: n.links?.map((l) => ({ label: l.label, sub: l.sub ?? "", href: l.href })),
    feature: n.feature
      ? {
          title: n.feature.title,
          text: n.feature.text,
          href: n.feature.href ?? n.href,
          photo: n.feature.photo ? getPhoto(n.feature.photo, "", "") : null,
        }
      : undefined,
  }));
  const hero = getHome().hero;
  return (
    <SiteHeaderClient nav={nav} siteName={site.name} cta={{ label: hero.ctaLabel, href: hero.ctaHref }} />
  );
}
