// Which images may appear on the public site. Shared by the site code and by
// scripts/sync-assets.mjs, which copies only these files into public/.
//
// An image is publishable only when content/image-sources.json documents a
// license for it. Booking.com photos and anything marked "תצוגה פנימית בלבד"
// are never publishable; the page shows a neutral placeholder instead.

export const INTERNAL_ONLY_MARK = "תצוגה פנימית בלבד";
const UNKNOWN_LICENSE = "לא תועד";

/** @param {string | undefined} license */
function isKnownLicense(license) {
  return !!license && !license.includes(UNKNOWN_LICENSE);
}

/**
 * @param {string} photo  value of a record's `photo` field
 * @param {string} photoNote  value of a record's `photoNote` field
 * @param {{ files: Record<string, { license?: string }>, remote: { file?: string, thumb1280?: string, license: string, author?: string }[] }} sources
 */
export function isPublishable(photo, photoNote, sources) {
  if (!photo) return false;
  if (photoNote && photoNote.includes(INTERNAL_ONLY_MARK)) return false;
  if (photo.includes("/hotels/bk-")) return false;

  if (/^https?:\/\//.test(photo)) {
    const entry = sources.remote.find((r) => (r.file && r.file === photo) || r.thumb1280 === photo);
    // CC BY / BY-SA require attribution, so an unknown author blocks publishing.
    return !!entry && isKnownLicense(entry.license) && !!entry.author && !entry.author.startsWith("TODO");
  }

  const file = photo.split("/").pop() ?? "";
  return isKnownLicense(sources.files[file]?.license);
}

/** @param {{ files: Record<string, { type?: string }> }} sources @param {string} photo */
export function isRendering(photo, sources) {
  const file = photo.split("/").pop() ?? "";
  return sources.files[file]?.type === "הדמיה";
}
