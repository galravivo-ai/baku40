import type { VerifyKind } from "@/lib/content";
import { Icon } from "../Icon";

const ICONS: Record<VerifyKind, string> = {
  ok: "check_circle",
  partial: "contrast",
  edit: "edit_note",
  pending: "schedule",
  none: "help",
};

/** Verification line on every card: green / purple / blue / orange / gray. */
export function VerifyBadge({ kind, text }: { kind: VerifyKind; text: string }) {
  if (!text) return null;
  return (
    <div className={`verify verify--${kind}`}>
      <Icon name={ICONS[kind]} />
      <span>{text}</span>
    </div>
  );
}
