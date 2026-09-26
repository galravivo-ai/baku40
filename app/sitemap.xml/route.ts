import { indexXml } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return new Response(indexXml(), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
