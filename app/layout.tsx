import type { Metadata, Viewport } from "next";
import { Assistant, Heebo } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { assertUniqueSeo, getSite } from "@/lib/content";
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
  // Fails the build on duplicate titles/descriptions (SEO spec §1, §10).
  assertUniqueSeo();
  return (
    <html lang={site.lang} dir={site.dir} className={`${heebo.variable} ${assistant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,200..400,0..1,-25..0&display=block"
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          דלג לתוכן
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
