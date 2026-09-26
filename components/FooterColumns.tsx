"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";

type Column = { head: string; items: { label: string; href: string }[] };

// Footer link columns. On phones each column is an accordion (design 1a mobile);
// on wider screens CSS shows every list regardless of the open state.
export function FooterColumns({ columns }: { columns: Column[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {columns.map((col, i) => {
        const isOpen = open === col.head;
        return (
          <nav key={col.head} className="site-footer__col" aria-label={col.head} data-open={isOpen}>
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`footer-col-${i}`}
                onClick={() => setOpen(isOpen ? null : col.head)}
              >
                <span>{col.head}</span>
                <Icon name={isOpen ? "remove" : "add"} />
              </button>
            </h2>
            <ul id={`footer-col-${i}`}>
              {col.items.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        );
      })}
    </>
  );
}
