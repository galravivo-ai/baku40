import type { NextConfig } from "next";
import redirects from "./content/redirects.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // The admin is a static page in public/admin/.
  async rewrites() {
    return { beforeFiles: [{ source: "/admin", destination: "/admin/index.html" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return (redirects.items as { from: string; to: string }[]).map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: true,
    }));
  },
};

export default nextConfig;
