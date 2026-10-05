import type { NextConfig } from "next";
import redirects from "./content/redirects.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Files read at request time (ISR home page, OG images) must ship with the server.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*"],
    "/og": ["./assets/fonts/**/*", "./design/assets/baku40-logo.png"],
  },
  // The admin is a static page in public/admin/.
  async rewrites() {
    return { beforeFiles: [{ source: "/admin", destination: "/admin/index.html" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [
      // One host only: the bare domain goes to www, which is what canonical
      // tags, the sitemap and structured data use (content/site.json baseUrl).
      ...[
        // pages keep the trailing slash in a single hop; files (.xml, .png…) don't get one
        { source: "/", destination: "https://www.baku40.co.il/" },
        { source: "/:file(.*\\.\\w+)", destination: "https://www.baku40.co.il/:file" },
        { source: "/:path+", destination: "https://www.baku40.co.il/:path+/" },
      ].map((r) => ({ ...r, has: [{ type: "host" as const, value: "baku40.co.il" }], statusCode: 301 as const })),
      ...(redirects.items as { from: string; to: string }[]).map((r) => ({
        source: r.from,
        destination: r.to,
        statusCode: 301 as const,
      })),
    ];
  },
};

export default nextConfig;
