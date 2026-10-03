import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import { Assistant, Heebo } from "next/font/google";
import { A11yWidget } from "@/components/A11yWidget";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { Trackers } from "@/components/consent/Trackers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { A11Y_BOOT } from "@/lib/a11y";
import { assertUniqueSeo, getSite } from "@/lib/content";
import { usedIcons } from "@/lib/icons";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-heebo",
});
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-assistant",
});

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(site.baseUrl),
    title: { default: site.defaultTitle, template: site.titleTemplate },
    description: site.defaultDescription,
    applicationName: site.name,
  };
}

export const viewport: Viewport = { themeColor: "#262A5B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const iconsHref = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,200..400,0..1,-25..0&icon_names=${usedIcons().join(",")}&display=block`;
  // Fails the build on duplicate titles/descriptions (SEO spec §1, §10).
  assertUniqueSeo();
  return (
    <html suppressHydrationWarning lang={site.lang} dir={site.dir} className={`${heebo.variable} ${assistant.variable}`}>
      <head>
        {/* Accessibility-menu choices, applied before the first paint (design 9h). */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
        {/* Organization + WebSite on every page; other markup points to them by @id. */}
        <JsonLd data={siteJsonLd()} />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Icon font: only the icons in use, loaded without blocking the first render. */}
        <link rel="preload" as="style" href={iconsHref} />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={iconsHref} media="print" data-async-css="" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.querySelectorAll('link[data-async-css]').forEach(function(l){if(l.sheet){l.media='all'}else{l.addEventListener('load',function(){l.media='all'})}})",
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={iconsHref} />
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          דלג לתוכן
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <A11yWidget />
        <CookieBanner />
        <Trackers />
      </body>
    </html>
  );
}
