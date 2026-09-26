import { z } from "zod";

// Shapes of the files in content/. The build validates every file against
// these, so a broken JSON edit fails the deploy instead of shipping a broken page.

const text = z.string();
const nullableText = z.string().nullable().optional();
// The admin (Decap CMS) saves cleared fields as "". Treat those as "not set".
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);
const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().optional());

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
    photoLicense: z.preprocess(emptyToUndefined, z.enum(["מורשה", "תצוגה פנימית", "הדמיה"]).optional()),
    verify: text,
    verifiedAt: nullableText,
    source: nullableText,
    area: nullableText,
    areaSlug: nullableText,
    district: nullableText,
    pinned: z.boolean().optional(),
    // hotels only
    score: optionalNumber,
    reviews: optionalNumber,
    stars: optionalNumber,
    // Optional long-form fields for a record's own page (design 2f). Sections
    // without data are not rendered.
    pitch: z.array(text).optional(),
    bottomLine: text.optional(),
    distances: z.array(z.object({ value: text, label: text })).optional(),
    facilities: z.array(text).optional(),
    pros: z.array(text).optional(),
    cons: z.array(text).optional(),
    roomsIntro: text.optional(),
    rooms: z.array(z.object({ name: text, text: text, size: text.optional() })).optional(),
    checklist: z.array(text).optional(),
    officialUrl: z.preprocess(emptyToUndefined, z.url().optional()),
    bookingUrl: z.preprocess(
      emptyToUndefined,
      z.string().startsWith("https://www.booking.com/", "bookingUrl חייב להתחיל ב-https://www.booking.com/").optional(),
    ),
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

const paragraphsBlock = z.object({ title: text, paragraphs: z.array(text) });

// Area pages (design 3b). Everything beyond slug/name/url is optional; the
// hotels, restaurants and shops of an area come from the collections by areaSlug.
export const areasSchema = z.object({
  note: text.optional(),
  // The /areas/ hub page.
  hub: z.object({ h1: text.min(1), intro: text, metaTitle: text, metaDescription: text }),
  items: z.array(
    z.object({
      slug: text.min(1),
      name: text.min(1),
      url: text.min(1),
      subtitle: text.optional(),
      heroPhoto: text.optional(),
      heroPhotoAlt: text.optional(),
      fits: paragraphsBlock.optional(),
      bestFor: z.array(z.object({ icon: text, label: text })).optional(),
      howTo: paragraphsBlock.extend({ tip: z.object({ title: text, text: text }).optional() }).optional(),
      whatsHere: z
        .array(
          z.object({
            tab: text,
            items: z.array(z.object({ name: text, meta: text, photo: text, photoAlt: text })),
          }),
        )
        .optional(),
      pros: z.array(text).optional(),
      cons: z.array(text).optional(),
      gettingThere: z.object({ title: text, text: text }).optional(),
      levels: z.array(z.object({ label: text, pct: z.number().min(0).max(100) })).optional(),
      itineraries: z.array(z.object({ title: text, meta: text })).optional(),
    }),
  ),
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

// content/pages/attractions.json (design 2a) + content/attractions.json (catalog)
export const attractionsPageSchema = z.object({
  url: text,
  crumbs: text,
  h1: text.min(1),
  intro: text,
  featured: z.object({ kicker: text, title: text, text: text, href: text }),
  searchPlaceholder: text,
  sort: text,
  count: text,
  filterGroups: z.array(z.object({ head: text, items: z.array(text) })),
  items: z.array(
    z.object({
      id: text,
      slug: text.min(1),
      // Own page: /attractions/{slug}/, or another page (e.g. a destination).
      href: text.regex(/^\/.*\/$/),
      photo: text,
      photoAlt: text,
      name: text.min(1),
      area: text,
      areaSlug: text,
      dur: text,
      tags: z.array(text),
      badge: text,
      note: text.min(1),
    }),
  ),
  editorialHeading: text,
  editorialParagraphs: z.array(text),
  box: z.object({ title: text, text: text }),
  faqTitle: text,
  faq: z.array(z.object({ q: text, a: text })),
  catalog: z.object({ title: text, text: text, groups: z.record(z.string(), text) }),
});
export type AttractionsPage = z.infer<typeof attractionsPageSchema>;

const catalogEntry = z.object({ name: text, nameEn: text.optional(), est: text.optional(), note: text.optional(), type: text.optional() });
export const attractionsCatalogSchema = z
  .object({
    meta: z.object({ source: text, license: text, retrieved: text, note: text.optional() }).passthrough(),
  })
  .catchall(z.unknown())
  .transform((raw) => {
    const groups: Record<string, z.infer<typeof catalogEntry>[]> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key !== "meta" && Array.isArray(value)) groups[key] = z.array(catalogEntry).parse(value);
    }
    return { meta: raw.meta, groups };
  });

// content/pages/editorial/*.json — pages whose text was copied from the
// design files (guide, investments, real estate, casino, travel info, system
// pages, articles). Each file becomes a page at its `url`.
const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h2"), text }),
  z.object({ type: z.literal("h3"), text }),
  z.object({ type: z.literal("p"), text }),
  z.object({ type: z.literal("note"), text }),
  z.object({ type: z.literal("kicker"), text }),
  z.object({ type: z.literal("callout"), title: text, text }),
  z.object({ type: z.literal("list"), items: z.array(text) }),
  z.object({ type: z.literal("link"), label: text, href: text }),
  z.object({ type: z.literal("image"), photo: text, alt: text }),
  z.object({ type: z.literal("stats"), items: z.array(z.object({ value: text, label: text })) }),
  z.object({ type: z.literal("facts"), items: z.array(z.object({ k: text, v: text })) }),
  z.object({
    type: z.literal("cards"),
    items: z.array(z.object({ title: text, text, href: text.optional(), note: text.optional() })),
  }),
  z.object({
    type: z.literal("photoCards"),
    items: z.array(
      z.object({
        photo: text,
        alt: text,
        title: text,
        badge: text.optional(),
        tag: text.optional(),
        text: text.optional(),
        facts: z.array(z.object({ k: text, v: text })).optional(),
        note: text.optional(),
        href: text.optional(),
      }),
    ),
  }),
  z.object({ type: z.literal("steps"), items: z.array(z.object({ title: text, text })) }),
  // Counts computed from the content files (never typed by hand).
  z.object({ type: z.literal("liveStats") }),
  z.object({
    type: z.literal("stops"),
    items: z.array(
      z.object({
        time: text,
        name: text,
        meta: text,
        text,
        tip: text.optional(),
        move: text.optional(),
        photo: text.optional(),
        alt: text.optional(),
        optional: z.boolean().optional(),
      }),
    ),
  }),
  z.object({ type: z.literal("faq"), items: z.array(z.object({ q: text, a: text })) }),
  z.object({ type: z.literal("sources"), items: z.array(z.object({ label: text, href: text.optional() })) }),
  z.object({ type: z.literal("table"), head: z.array(text), rows: z.array(z.array(text)) }),
]);
export type Block = z.infer<typeof block>;

export const editorialPageSchema = z.object({
  slug: text.optional(),
  url: text.regex(/^\/.*\/$/, "url חייב להתחיל ולהסתיים ב-/"),
  seo: z.object({
    metaTitle: text.nullable().optional(),
    metaDescription: text.nullable().optional(),
    robots: text.default("index,follow"),
  }),
  h1: text.min(1),
  intro: text,
  meta: z.array(text),
  images: z.array(z.object({ photo: text, alt: text })),
  imageNote: text.optional(),
  blocks: z.array(block),
});
export type EditorialPage = z.infer<typeof editorialPageSchema>;
