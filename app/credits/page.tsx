import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getImageSources, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Image credits (design 13d) — built from content/image-sources.json.

type CreditsPage = {
  url: string;
  h1: string;
  intro: string;
  photosTitle: string;
  renderingsTitle: string;
  renderingsText: string;
};

function loadPage(): CreditsPage {
  return JSON.parse(readFileSync(join(process.cwd(), "content", "pages", "credits.json"), "utf8"));
}

export function generateMetadata() {
  const page = loadPage();
  const s = getSite().staticPages.find((p) => p.url === page.url);
  return pageMetadata({
    path: page.url,
    title: s?.metaTitle,
    fallbackTitle: page.h1,
    description: s?.metaDescription,
    fallbackDescription: page.intro,
    robots: s?.robots,
  });
}

const pending = (v?: string) => !v || v.startsWith("TODO") || v.includes("לא תועד");

export default function CreditsPage() {
  const page = loadPage();
  const sources = getImageSources();
  const files = Object.entries(sources.files) as [string, Record<string, string | undefined>][];
  const photos = files.filter(([, v]) => v.type !== "הדמיה");
  const renderings = files.filter(([, v]) => v.type === "הדמיה");

  return (
    <div className="container listing-head narrow-page">
      <Breadcrumbs crumbs={[{ label: "דף הבית", href: "/" }, { label: page.h1, href: page.url }]} />
      <h1 className="listing-h1">{page.h1}</h1>
      <p className="listing-intro">{page.intro}</p>

      <h2 className="ed-h2">{page.photosTitle}</h2>
      <div className="ed-table-wrap">
        <table className="ed-table">
          <thead>
            <tr>
              <th>תמונה</th>
              <th>צלם / מקור</th>
              <th>רישיון</th>
              <th>קישור</th>
            </tr>
          </thead>
          <tbody>
            {sources.remote.map((r) => (
              <tr key={r.name}>
                <th scope="row">{String(r.subject ?? r.name)}</th>
                <td>{pending(r.author) ? "ממתין להשלמה" : r.author}</td>
                <td>{r.license}</td>
                <td>
                  {r.page ? (
                    <a href={r.page} target="_blank" rel="noopener">
                      Wikimedia Commons
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {photos.map(([file, v]) => (
              <tr key={file}>
                <th scope="row">{v.subject ?? file.replace(/\.\w+$/, "").replace(/-/g, " ")}</th>
                <td>{pending(v.source) ? "ממתין להשלמה" : v.source}</td>
                <td>{pending(v.license) ? "ממתין להשלמה" : v.license}</td>
                <td>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="ed-h2">{page.renderingsTitle}</h2>
      <p className="ed-p">{page.renderingsText}</p>
      <div className="ed-table-wrap">
        <table className="ed-table">
          <thead>
            <tr>
              <th>חומר</th>
              <th>מקור</th>
              <th>הרשאה</th>
            </tr>
          </thead>
          <tbody>
            {renderings.map(([file, v]) => (
              <tr key={file}>
                <th scope="row">{v.subject ?? file}</th>
                <td>{v.source}</td>
                <td>{v.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="related" />
    </div>
  );
}
