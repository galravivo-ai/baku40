"use client";

import { useSaved } from "@/lib/saved";

export function SaveButton({ id, name, className = "btn btn--outline" }: { id: string; name: string; className?: string }) {
  const { has, toggle } = useSaved();
  const saved = has(id);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={saved}
      aria-label={saved ? `הסרת ${name} מהטיול שלי` : `שמירת ${name} בטיול שלי`}
      onClick={() => toggle(id)}
    >
      {saved ? "✓ נשמר" : "שמירה"}
    </button>
  );
}
