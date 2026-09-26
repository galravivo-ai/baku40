import type { PhotoInfo, VerifyKind } from "@/lib/content";

/** Serializable card data passed from the server page to the client listing. */
export type CardData = {
  id: string;
  name: string;
  meta: string;
  text: string;
  foot: string;
  icon: string;
  cta: string;
  badge: string;
  href?: string;
  booking?: { href: string; disclosure: string; disclosureHref: string };
  photo: PhotoInfo;
  verify: string;
  verifyKind: VerifyKind;
  /** Text the filter chips and the search box match against. */
  facets: string[];
  searchText: string;
};

export type FilterGroup = { head: string; items: string[] };
