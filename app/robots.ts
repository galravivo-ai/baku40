import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/content";
import { isProductionIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
