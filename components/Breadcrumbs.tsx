import Link from "next/link";
import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="פירורי לחם" className="crumbs">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.label + i}>
            {i === crumbs.length - 1 ? (
              <span aria-current="page">{c.label}</span>
            ) : c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
