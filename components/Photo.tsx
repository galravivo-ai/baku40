import Image from "next/image";
import { getPhoto } from "@/lib/content";
import { Icon } from "./Icon";

/**
 * A cover photo that fills its (position: relative) parent. Unpublishable
 * photos render the neutral striped placeholder instead.
 */
export function Photo({
  photo,
  alt,
  note = "",
  sizes,
  priority,
  icon,
  className = "cover-img",
  showTags = true,
}: {
  photo: string;
  alt: string;
  note?: string;
  sizes: string;
  priority?: boolean;
  icon?: string;
  className?: string;
  showTags?: boolean;
}) {
  const info = getPhoto(photo, note, alt);
  if (!info) {
    return (
      <div className="placeholder" aria-hidden="true">
        {icon && <Icon name={icon} />}
      </div>
    );
  }
  return (
    <>
      <Image className={className} src={info.src} alt={info.alt} fill sizes={sizes} priority={priority} />
      {showTags && info.isRendering && <span className="photo-tag photo-tag--corner">הדמיה, לא צילום</span>}
      {showTags && info.credit && <span className="photo-tag photo-tag--corner">צילום: {info.credit}</span>}
    </>
  );
}
