import { z } from "zod";

// Shapes of the files in content/. The build validates every file against
// these, so a broken JSON edit fails the deploy instead of shipping a broken page.

const text = z.string();
const nullableText = z.string().nullable().optional();

export const navLinkSchema = z.object({
  label: text.min(1),
  href: text.min(1),
  sub: text.optional(),
});

export const navItemSchema = z.object({
  label: text.min(1),
  href: text.min(1),
  links: z.array(navLinkSchema).optional(),
  feature: z
    .object({
      title: text,
      text: text,
      photo: text.optional(),
      href: text.optional(),
    })
    .optional(),
});

export const siteSchema = z.object({
  name: text.min(1),
  locale: text,
  lang: text,
  dir: z.enum(["rtl", "ltr"]),
  baseUrl: z.url(),
  titleTemplate: text.includes("%s"),
  defaultTitle: text.min(1),
  defaultDescription: text.min(1),
  defaultOgImage: text,
  twitterCard: text,
  organization: z.record(z.string(), z.unknown()),
  staticPages: z.array(
    z.object({
      url: text,
      metaTitle: text,
      metaDescription: text,
      schema: z.array(text),
      robots: text.optional(),
    }),
  ),
  nav: z.array(navItemSchema).min(1),
  footer: z.array(navLinkSchema),
  footerTagline: text,
  footerColumns: z.array(z.object({ head: text, items: z.array(navLinkSchema) })),
  copyright: text,
  affiliateDisclosure: text.min(1),
  affiliateDisclosureShort: text.min(1),
  // Owner's choice: show Booking.com hotel photos although they are not licensed.
  showBookingPhotos: z.boolean().default(false),
  // Owner's choice: show design photos whose source/license is "לא תועד".
  showUndocumentedPhotos: z.boolean().default(false),
});

export const itemSeoSchema = z.object({
  metaTitle: nullableText,
  metaDescription: nullableText,
  schemaType: nullableText,
  noindex: z.boolean().default(false),
});

export const itemSchema = z
  .object({
    name: text.min(1, "name חובה"),
    slug: text.min(1, "slug חובה"),
    url: nullableText,
    meta: text,
    text: text.min(1, "text חובה"),
    foot: text,
    icon: text,
    cta: text,
    badge: text,
    photo: text,
    photoAlt: text,
    photoNote: text,
    photoLicense: z.enum(["מורשה", "תצוגה פנימית", "הדמיה"]).optional(),
    verify: text,
    verifiedAt: nullableText,
    source: nullableText,
    area: nullableText,
    areaSlug: nullableText,
    district: nullableText,
    pinned: z.boolean().optional(),
    // hotels only
    score: z.number().optional(),
    reviews: z.number().int().optional(),
    stars: z.number().int().nullable().optional(),
    bookingUrl: z
      .string()
      .startsWith("https://www.booking.com/", "bookingUrl חייב להתחיל ב-https://www.booking.com/")
      .nullable()
      .optional(),
    seo: itemSeoSchema,
  })
  .superRefine((item, ctx) => {
    if (item.photo && !item.photoAlt) {
      ctx.addIssue({ code: "custom", path: ["photoAlt"], message: "photoAlt חובה כשיש photo" });
    }
  });

export const collectionSeoSchema = z.object({
  metaTitle: text.min(1),
  metaDescription: text.min(1),
  canonical: text.min(1),
  ogImage: text,
  ogImageAlt: text,
  robots: text.default("index,follow"),
  schema: z.array(text),
  editorialHeading: text,
  editorialBody: text,
});

export const collectionSchema = z.object({
  id: text.min(1),
  screen: text,
  url: text.regex(/^\/.*\/$/, "url חייב להתחיל ולהסתיים ב-/"),
  // "landing" = 8f layout: photo hero with the h1 on it
  layout: z.enum(["plain", "landing"]).default("plain"),
  heroPhoto: text.optional(),
  heroPhotoAlt: text.optional(),
  h1: text.min(1),
  crumbs: text,
  intro: text,
  searchPlaceholder: text,
  sort: text,
  count: text,
  sortBy: text.optional(),
  filterGroups: z.array(z.object({ head: text, items: z.array(text) })),
  seo: collectionSeoSchema,
  box: z.object({ title: text, text: text }),
  items: z.array(itemSchema),
});

export const areasSchema = z.object({
  note: text.optional(),
  items: z.array(z.object({ slug: text.min(1), name: text.min(1), url: text.min(1) })),
});

export const redirectsSchema = z.object({
  items: z.array(z.object({ from: text.min(1), to: text.min(1) })),
});

const imageEntrySchema = z
  .object({
    source: text.optional(),
    license: text.optional(),
    type: text.optional(),
    note: text.optional(),
  })
  .passthrough();

export const imageSourcesSchema = z
  .object({
    images: z.array(
      z
        .object({
          name: text,
          page: text.optional(),
          file: text.optional(),
          thumb1280: text.optional(),
          license: text,
          author: text.optional(),
        })
        .passthrough(),
    ),
  })
  .catchall(z.unknown())
  .transform((raw) => {
    // Local files are keyed by filename at the top level of the JSON.
    const files: Record<string, z.infer<typeof imageEntrySchema>> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (/\.(png|jpe?g|webp|avif)$/i.test(key)) files[key] = imageEntrySchema.parse(value);
    }
    return { remote: raw.images, files };
  });

export type Site = z.infer<typeof siteSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type Item = z.infer<typeof itemSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type Area = z.infer<typeof areasSchema>["items"][number];
export type ImageSources = z.infer<typeof imageSourcesSchema>;

// content/pages/home.json (design: Baku40 Home.dc.html)
const photoFields = { photo: text, photoAlt: text };
const linkSchema = z.object({ label: text, href: text });

export const homeSchema = z.object({
  hero: z.object({
    ...photoFields,
    kicker: text,
    h1: text.min(1),
    intro: text,
    searchPlaceholder: text,
    ctaLabel: text,
    ctaHref: text,
    choices: z.array(z.object({ title: text, href: text })),
    utility: z.array(z.object({ label: text, value: text, live: z.literal("weather").optional() })),
  }),
  quick: z.array(z.object({ title: text, icon: text, href: text, sub: text })),
  firstTime: z.object({
    ...photoFields,
    kicker: text,
    title: text,
    text: text,
    items: z.array(z.object({ num: text, title: text, icon: text, sub: text, href: text })),
  }),
  attractions: z.object({
    title: text,
    text: text,
    linkLabel: text,
    filters: z.array(text).min(1),
    items: z.array(
      z.object({ id: text, ...photoFields, name: text, area: text, dur: text, tags: z.array(text), note: text }),
    ),
  }),
  planner: z.object({
    kicker: text,
    title: text,
    text: text,
    daysLabel: text,
    whoLabel: text,
    interestsLabel: text,
    who: z.array(text).min(1),
    interests: z.array(text),
    previewLabel: text,
    days: z.array(text).min(1),
    kidsDay2: text,
    ctaLabel: text,
    ctaHref: text,
    footnote: text,
  }),
  itineraries: z.object({
    title: text,
    href: text,
    items: z.array(z.object({ days: text, title: text, text: text, meta: text })),
  }),
  hotels: z.object({
    title: text,
    text: text,
    linkLabel: text,
    items: z.array(
      z.object({ slug: text, stars: text, area: text, ...photoFields, text: text, tags: z.array(text), walk: text }),
    ),
  }),
  food: z.object({
    title: text,
    text: text,
    items: z.array(z.object({ slug: text, icon: text, ...photoFields, meta: text, note: text })),
    linksTitle: text,
    links: z.array(linkSchema),
  }),
  practical: z.object({
    title: text,
    checked: text,
    linkLabel: text,
    href: text,
    items: z.array(z.object({ title: text, icon: text, text: text })),
  }),
  realEstate: z.object({
    kicker: text,
    title: text,
    text: text,
    links: z.array(text),
    linksHref: text,
    projects: z.array(
      z.object({ name: text, text: text, meta: text, photo: text, badge: text, href: text }),
    ),
  }),
  magazine: z.object({
    title: text,
    href: text,
    items: z.array(z.object({ cat: text, photo: text, title: text, text: text })),
  }),
});
export type Home = z.infer<typeof homeSchema>;
