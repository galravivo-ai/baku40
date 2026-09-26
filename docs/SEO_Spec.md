# Baku40: מפרט SEO
מחייב למימוש. כל הערכים נקראים מ‑`content/*.json`, ואין ערכי SEO קשיחים בקוד.

## 1. Metadata לכל עמוד
| שדה | מקור | כלל |
|---|---|---|
| `<title>` | `seo.metaTitle`, ואם חסר: `h1` + `site.titleTemplate` | עד 60–65 תווים. ייחודי בכל האתר, וה‑build נכשל על כפילות |
| `meta description` | `seo.metaDescription`, ואם חסר: `intro` מקוצר | 120–155 תווים. ייחודי |
| `canonical` | `site.baseUrl` + `seo.canonical` או `url` | מוחלט, עם `/` בסוף. עמודי פילטר מצביעים לעמוד האוסף |
| `robots` | `seo.robots` (ברירת מחדל `index,follow`) | ב‑preview של Vercel תמיד `noindex` |
| `html` | `lang="he" dir="rtl"` | |
| OG / Twitter | `og:title`, `og:description`, `og:image` (1200×630), `og:locale=he_IL`, `og:type`, `twitter:card=summary_large_image` | אם `ogImage` ריק, מייצרים תמונה אוטומטית (`next/og`) עם הכותרת והלוגו |

אתר בשפה אחת: `hreflang="he"` עם `x-default`. אין גרסאות שפה נוספות.

## 2. URLs
- אותיות לטיניות קטנות, מקפים, `/` בסוף: `/hotels/the-merchant-baku/`.
- `slug` נשמר ברשומה. **שינוי slug ⇒ redirect 301 אוטומטי** מהכתובת הישנה. מנהלים את זה ב‑`content/redirects.json`, שממשק הניהול מוסיף אליו לבד.
- פילטרים ומיון ב‑query string (`?area=sabail`), עם `canonical` לעמוד האוסף, בלי אינדוקס.
- עמודים: `/`, `/hotels/`, `/hotels/{slug}/`, `/restaurants/`, `/restaurants/kosher/`, `/itineraries/`, `/shopping/`, `/day-trips/`, `/attractions/`, `/attractions/{slug}/`, `/areas/{slug}/`, `/travel-info/…`, `/magazine/{slug}/`, `/about/`, `/credits/`.

## 3. Schema.org (JSON-LD)
| עמוד | סוג |
|---|---|
| דף הבית | `WebSite` (עם `SearchAction`) + `Organization` (מ‑`site.organization`) |
| אוסף (8a–8f) | `CollectionPage` + `BreadcrumbList` + `ItemList` של הרשומות |
| מלון | `Hotel`: name, address, geo, url, image (רק מורשית), `starRating` |
| אטרקציה | `TouristAttraction`: name, geo, address, openingHours (רק אם אומת) |
| אזור | `Place` + `BreadcrumbList` |
| מאמר | `Article`: headline, author (עמוד כותב 15a), datePublished, dateModified |
| מסלול | `TouristTrip` |
| שאלות נפוצות | `FAQPage`, רק כשיש בלוק שאלות ותשובות גלוי בעמוד |

איסורים:
- **אין** `aggregateRating` או `review`, כי הציונים הם של Booking ולא שלנו.
- **אין** מחיר ב‑schema.
- **אין** שדה שלא מוצג בעמוד.

לבדוק ב‑Rich Results Test לפני העלייה.

## 4. תמונות
- כל תמונה עם `alt` מ‑`photoAlt`, בעברית: מה רואים ואיפה. תמונה דקורטיבית מקבלת `alt=""`.
- `next/image`, בפורמטים WebP/AVIF, עם `width`/`height` מפורשים. `priority` רק לתמונת ההירו.
- שם קובץ תיאורי באנגלית: `maiden-tower-old-city.webp`.
- תמונה בלי רישיון לא נכנסת ל‑sitemap ולא ל‑OG.

## 5. קישורים פנימיים
- **Breadcrumbs** גלויים בכל עמוד, מתוך `crumbs`.
- רשומה עם `areaSlug` ⇒ קישור לעמוד האזור (`content/areas.json`). עמוד אזור ⇒ כל המלונות, המסעדות והקניות באותו `areaSlug`.
- **עמוד מלון** ⇒ 3 מלונות באותו אזור, מסעדות קרובות ומסלול רלוונטי.
- **מאמר** ⇒ לפחות 3 קישורים לעמודי אוסף או ישות.
- **פוטר** עם קישורים לכל האוספים. **מפת אתר למשתמש** ב‑15c.
- טקסט עוגן תיאורי ("מלונות בעיר העתיקה"), ולא "לחצו כאן".

## 6. קבצים טכניים
- `sitemap.xml`: נוצר אוטומטית מכל עמוד `index`, עם `lastmod` מתאריך העדכון של הרשומה. מפוצל לפי סוג (hotels, restaurants וכו׳). כולל image sitemap לתמונות מורשות.
- `robots.txt`: מתיר הכול מלבד `/admin/` ו‑`/api/`, ומפנה ל‑sitemap.
- **404** מעוצב (קיים בעיצוב), עם חיפוש וקישורים לאוספים, ומחזיר סטטוס 404 אמיתי.
- `redirects.json` ⇒ 301 ב‑`next.config`.

## 7. ביצועים (Core Web Vitals)
- יעד: LCP < 2.5s, CLS < 0.1, INP < 200ms במובייל.
- עמודים סטטיים (SSG). מפה ווידג׳טים חיים בטעינה עצלה.
- פונטים עם `next/font`: Heebo ו‑Assistant, subset עברית ולטינית, `display: swap`.

## 8. תוכן
- אסור להעתיק תיאורים מ‑Booking או מגוגל. רק טקסט מקורי.
- עמוד עם פחות מ‑150 מילים של תוכן ייחודי מקבל `noindex` עד שמשלימים אותו. ממשק הניהול מציג אזהרה.
- `dateModified` גלוי בכל עמוד ("נבדק ב‑23.9.2026"), מתוך שדה `verify`.

## 9. אחרי העלייה (באחריות הבעלים)
- חיבור **Google Search Console** ו‑**Bing Webmaster**, ושליחת ה‑sitemap.
- **Google Analytics 4** או Plausible, עם באנר הסכמה לעוגיות.
- פרופיל **Google Business**, אם רלוונטי.
- מחקר מילות מפתח (Keyword Planner או Ahrefs) ועדכון `metaTitle` לפי הממצאים.

## 10. בדיקה לפני עלייה
- [ ] אין `title` או `description` כפולים (בדיקת build)
- [ ] כל עמוד עם canonical
- [ ] JSON-LD תקין ב‑Rich Results Test
- [ ] sitemap נטען, ו‑robots לא חוסם עמודים ציבוריים
- [ ] preview ב‑noindex, production ב‑index
- [ ] 404 מחזיר סטטוס 404
- [ ] Lighthouse SEO ≥ 95, Performance ≥ 90 במובייל
- [ ] לכל תמונה יש alt
