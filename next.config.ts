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
    return (redirects.items as { from: string; to: string }[]).map((r) => ({
      source: r.from,
      destination: r.to,
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;
