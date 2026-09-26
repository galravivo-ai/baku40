import { SITEMAPS, urlsetXml, type SitemapName } from "@/lib/sitemap";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SITEMAPS).map((name) => ({ file: `${name}.xml` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = (await params).file.replace(/\.xml$/, "") as SitemapName;
  return new Response(urlsetXml(SITEMAPS[name]()), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
