/** Material Symbols Rounded glyph; names come from the content `icon` fields. */
export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span className={className ? `icon ${className}` : "icon"} aria-hidden="true">
      {name}
    </span>
  );
}
