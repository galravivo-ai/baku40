// Which images may appear on the public site. Shared by the site code and by
// scripts/sync-assets.mjs, which copies only these files into public/.
//
// An image is publishable only when content/image-sources.json documents a
// license for it. Booking.com hotel photos (marked "תצוגה פנימית בלבד") are
// shown only when the owner turns on `showBookingPhotos` in content/site.json;
// local photos whose license is "לא תועד" only with `showUndocumentedPhotos`.
// Anything else unlicensed renders as a neutral placeholder.

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
 * @param {{ showBookingPhotos?: boolean, showUndocumentedPhotos?: boolean, license?: string }} [options]
 *   license: the record's `photoLicense` field set in the admin.
 */
export function isPublishable(photo, photoNote, sources, options = {}) {
  if (!photo) return false;
  if (options.license === "מורשה" || options.license === "הדמיה") return true;
  if (options.license === "תצוגה פנימית") return false;
  // Uploaded through the admin: shown only once a license is chosen there.
  if (photo.includes("/uploads/")) return false;
  if (isBookingPhoto(photo)) return !!options.showBookingPhotos;
  if (photoNote && photoNote.includes(INTERNAL_ONLY_MARK)) return false;

  if (/^https?:\/\//.test(photo)) {
    const entry = sources.remote.find((r) => (r.file && r.file === photo) || r.thumb1280 === photo);
    // CC BY / BY-SA require attribution, so an unknown author blocks publishing.
    return !!entry && isKnownLicense(entry.license) && !!entry.author && !entry.author.startsWith("TODO");
  }

  const file = photo.split("/").pop() ?? "";
  if (isKnownLicense(sources.files[file]?.license)) return true;
  // Local design photos only: remote images always need a documented license.
  return !!options.showUndocumentedPhotos && photo.startsWith("assets/photos/");
}

/** @param {string} photo */
export function isBookingPhoto(photo) {
  return photo.includes("/hotels/bk-");
}

/** @param {{ files: Record<string, { type?: string }> }} sources @param {string} photo */
export function isRendering(photo, sources) {
  const file = photo.split("/").pop() ?? "";
  return sources.files[file]?.type === "הדמיה";
}
