import type { NextConfig } from "next";
import redirects from "./content/redirects.json";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    return (redirects.items as { from: string; to: string }[]).map((r) => ({
      source: r.from,
      destination: r.to,
      permanent: true,
    }));
  },
};

export default nextConfig;
