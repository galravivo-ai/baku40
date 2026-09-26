import "server-only";
import type { Item } from "./schema";

/**
 * "בדקו זמינות" target: the hotel's bookingUrl, or a Booking.com search by
 * name when there is none. BOOKING_AFFILIATE_ID is added once the owner has it.
 */
export function bookingHref(item: Item): string {
  const url = item.bookingUrl
    ? new URL(item.bookingUrl)
    : new URL("https://www.booking.com/searchresults.he.html");
  if (!item.bookingUrl) url.searchParams.set("ss", `${item.name}, Baku`);
  const aid = process.env.BOOKING_AFFILIATE_ID;
  if (aid) url.searchParams.set("aid", aid);
  return url.toString();
}
