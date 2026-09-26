import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { visualRtl, wrap } from "@/lib/bidi";

// Automatic share image (1200×630) for pages without an ogImage (SEO spec §1):
// the page title on the brand navy with the logo.

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("t") ?? "Baku40").slice(0, 120);
  const title = raw.replace(/\s*\|\s*Baku40\s*$/, "");
  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "assets", "fonts", "Heebo-ExtraBold.ttf")),
    readFile(join(process.cwd(), "design", "assets", "baku40-logo.png")),
  ]);
  const lines = wrap(title, 26).slice(0, 3);
  const size = lines.length > 2 ? 64 : 76;
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          background: "linear-gradient(135deg, #1A1D42 0%, #262A5B 60%, #1665C1 140%)",
          padding: "64px 72px",
          fontFamily: "Heebo",
        }}
      >
        <div style={{ display: "flex", background: "#FFFFFF", borderRadius: 14, padding: "12px 18px" }}>
          <img src={logoSrc} width={176} height={50} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {lines.map((l) => (
            <div key={l} style={{ fontSize: size, color: "#FFFFFF", lineHeight: 1.15 }}>
              {visualRtl(l)}
            </div>
          ))}
          <div style={{ marginTop: 18, width: 120, height: 6, background: "#4A94E8", borderRadius: 3 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Heebo", data: font, weight: 800, style: "normal" }],
      headers: { "cache-control": "public, max-age=86400, s-maxage=31536000, immutable" },
    },
  );
}
