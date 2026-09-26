# Handoff: אתר Baku40 — מדריך בעברית לבאקו

## Overview
Baku40 הוא אתר תוכן בעברית (RTL) למטיילים ישראלים לבאקו: אטרקציות, מלונות, מסעדות, כשרות, מסלולים, קניות, טיולי יום, מידע למטייל ונדל"ן. החבילה הזו מיועדת ל‑Claude Code או למפתח, כדי לבנות את האתר החי ולהעלות אותו לאוויר.

## About the Design Files
הקבצים בתיקייה `design/` הם **עיצובי רפרנס ב‑HTML**. הם מראים את המראה וההתנהגות הרצויים, ואינם קוד פרודקשן להעתקה. המשימה: לבנות אותם מחדש ב‑**Next.js (App Router) + TypeScript**, ולהעלות ל‑**Vercel** מתוך מאגר GitHub.
לצפייה: פותחים את `design/Baku40 Site.dc.html` (מפת כל המסכים) בדפדפן. הקבצים צריכים את `support.js` ואת `assets/` שבאותה תיקייה.

## Fidelity
**High-fidelity.** הצבעים, הטיפוגרפיה, המרווחים והטקסטים סופיים. יש לשחזר אותם בנאמנות מלאה.

---

## דרישה מס׳ 1: כל התוכן בקבצי נתונים
הבעלים מעדכן את האתר בלי לגעת בקוד. לכן:
- **כל** רשומה וכל טקסט עריכתי של אוסף נקרא מ‑`content/*.json`. אסור טקסט קשיח בקומפוננטות, מלבד רכיבי ממשק כמו כפתורים ותוויות.
- החלפת קובץ JSON ב‑GitHub ⇒ Vercel בונה מחדש ⇒ האתר מתעדכן. אין צורך בשום צעד נוסף.
- יש לוודא את התוכן בזמן build (למשל עם zod). אם קובץ שבור, ה‑build נכשל עם הודעה ברורה, ולא עולה אתר שבור.
- **ממשק ניהול כבר בשלב 1:** TinaCMS ב‑`/admin`, שעורך את אותם קבצי JSON. המפרט המלא ב‑`docs/CMS_Spec.md`.
- **SEO:** המפרט המחייב ב‑`docs/SEO_Spec.md`. כל ערכי ה‑SEO נמצאים בקבצי התוכן.
- שלב 2 (לא עכשיו): מעבר ל‑Payload + PostgreSQL לפי `docs/Baku40_API_Handoff_for_Claude_Code.md`. יש לתכנן את שכבת הקריאה (`lib/content.ts`) כך שאפשר יהיה להחליף את המקור בלי לגעת ב‑UI.

### קבצי תוכן
| קובץ | מסך | URL | רשומות |
|---|---|---|---|
| `content/hotels.json` | 8b | `/hotels/` | 28, ממוינים לפי `reviews` בסדר יורד |
| `content/restaurants.json` | 8a | `/restaurants/` | 14 |
| `content/kosher.json` | 8f | `/restaurants/kosher/` | 12 |
| `content/itineraries.json` | 8c | `/itineraries/` | 9 |
| `content/shopping.json` | 8d | `/shopping/` | 14 |
| `content/day-trips.json` | 8e | `/day-trips/` | 7 |
| `content/attractions.json` | 2a/2b | `/attractions/` | ישויות אטרקציות |
| `content/site.json` | כל האתר | — | שם, תבנית כותרת, ברירות מחדל ל‑SEO, Organization, עמודים סטטיים |
| `content/areas.json` | 3b | `/areas/{slug}/` | 8 אזורים, בסיס לקישורים פנימיים |
| `content/image-sources.json` | 13d | `/credits/` | מקור ורישיון לכל תמונה |
| `content/verification-log.json` | — | — | יומן אימות, פנימי ולא לפרסום |

מבנה אוסף: `h1, crumbs, intro, searchPlaceholder, sort, count, filterGroups[{head, items[]}], seo{metaTitle, metaDescription, canonical, ogImage, ogImageAlt, robots, schema[], editorialHeading, editorialBody}, box{title, text}, items[]`.
הבלוק העריכתי בתחתית העמוד הוא `seo.editorialHeading` ו‑`seo.editorialBody`.
מבנה רשומה: `name, slug, url, meta, text, foot, icon (Material Symbols), cta, badge, photo, photoAlt, photoNote, verify, area, areaSlug, seo{metaTitle, metaDescription, schemaType, noindex}`. ל‑`url` יש ערך רק ברשומות עם עמוד משלהן (בשלב 1: מלונות). במלונות יש בנוסף `score, reviews, stars, bookingUrl`, ו‑`district` כשהוא ידוע.
`count` צריך להיות מחושב מ‑`items.length` ולא נלקח מהטקסט בקובץ.

### כללי תצוגה מחייבים
- **תמונות:** רשומה שה‑`photoNote` שלה מכיל "תצוגה פנימית בלבד", או ש‑`photo` שלה ריק, מוצגת בפרודקשן עם placeholder ניטרלי ולא עם התמונה. עבור תמונות מ‑Booking אין עדיין רישיון.
- **אימות:** השדה `verify` מוצג בכל כרטיס כשורה קטנה. בכשרות יש 4 מצבים לפי הצבע: ירוק (אומת), סגול (חלקי), כתום (נטען ולא אושר) ואפור (לא מאומת). ראו את 8f בעיצוב.
- **מלון** מוצג רק אם יש לו `text`. מלון בלי תיאור לא נכנס לקובץ.
- **"בדקו זמינות":** בשלב 1 הכפתור מקשר ל‑`bookingUrl`, בתוספת affiliate ID ממשתנה סביבה כשיתקבל. בלי `bookingUrl`, הכפתור מקשר לחיפוש Booking לפי שם המלון. ליד כל כפתור כזה מוצג גילוי נאות על עמלות.
- אין `aggregateRating` בסכימה, ואין ציוני ביקורות כנתונים מובנים לגוגל.

---

## Screens / Views
המפה המלאה נמצאת ב‑`design/Baku40 Site.dc.html` ובקובץ `docs/Baku40_Screens_Status.md`. ה‑IDs כמו `#8b` הם עוגנים בקבצי העיצוב.
| קובץ עיצוב | מסכים |
|---|---|
| `Baku40 Home.dc.html` | דף הבית, ניווט מגה, חיפוש, מפה, Trip Planner |
| `Baku40 Collection Listings.dc.html` | 8a–8f: אוספי ליסטינג (תבנית אחת משותפת) |
| `Baku40 Listing and Details.dc.html` | 2a ליסטינג ישויות, 2b אטרקציה, 2f מלון |
| `Baku40 Editorial Templates.dc.html` | 3a מגזין, 3b אזור/יעד, מאמר, מסלול |
| `Baku40 Travel Info.dc.html` | 7a מידע למטייל, 6 עמודי נושא, מזג אוויר ל‑12 חודשים |
| `Baku40 Shopping Nightlife.dc.html` | קניות, 13d קרדיטים לתמונות |
| `Baku40 Real Estate.dc.html` | 5a רכזת "השקעות נדל״ן בבאקו" (off‑plan מול גמור, עלויות נלוות, סף 100 אלף AZN להיתר שהייה), 5b עמוד פרויקט "סי בריז · Sea Breeze" (הצהרות יזם מול עובדות מאומתות, מקור לכל נתון) |
| `Baku40 SEO Pillar Pages.dc.html` | 9a מדריך באקו, 9b השקעות בבאקו, 9c השקעות באזרבייג׳ן: עמודי עוגן ל‑SEO |
| `Baku40 Royal Casino.dc.html` | עמוד קזינו |
| `Baku40 Flights and System Pages.dc.html` | טיסות, אודות, משפטי, 404 |
| `Baku40 Trust and Navigation.dc.html` | 15a כותב, 15b רכזת נושא, 15c מפת אתר |
| `Baku40 Newsletter.dc.html` | ניוזלטר |
| `Baku40 Mobile Screens.dc.html` | מסכי מובייל (390×844), כולל רשימת מלונות עם פילטרים ועמוד מלון: רפרנס ל‑responsive |
| `Baku40 Design System.dc.html` | קומפוננטות, צבע, טיפוגרפיה: **לקרוא ראשון** |
| `CMS`, `External Data`, `Enrichment Review`, `Product Screens`, `Attractions Live` | ממשקי ניהול. שלב 2, לא לבנות עכשיו |

### תבנית ליסטינג (8a–8f)
ניווט עליון, breadcrumbs, `h1` ו‑`intro`, שורת חיפוש עם מיון וספירה, ולצידם עמודת פילטרים (צ׳יפים שמסננים בצד הלקוח) וגריד כרטיסים. מתחת: בלוק SEO (`seo.title` + `seo.body`) ותיבת מידע (`box`). ב‑8f יש גם הירו עם תמונה. המידות המדויקות נמצאות בקובץ העיצוב.

### ניווט ראשי (8 פריטים, זהה בכל העמודים)
מדריך באקו (`/baku/` ← 9a) · אטרקציות (2a) · מלונות (8b) · אוכל (8a) · קניות (8d) · השקעות (9b) · קזינו · מגזין (3a).
במדריך באקו, אטרקציות והשקעות יש מגה‑תפריט (ראו `D.nav` בדף הבית). הפריט הפעיל מסומן בקו תחתון `#1665C1`. את הניווט יש לקרוא מ‑`content/site.json` ולא לקבע בקוד.

### תוכן שעדיין בתוך קבצי העיצוב
לעמודי נדל״ן (5a, 5b), עמודי ה‑SEO (9a–9c) והקזינו אין עדיין קובץ JSON. יש לחלץ את הטקסט מקבצי העיצוב **כלשונו** לקבצים `content/pages/*.json` (אותו מבנה `seo{}`), בלי לשכתב ובלי להוסיף נתונים. בנדל״ן לכל נתון מספרי יש מקור, ויש לשמור את שדה המקור.

### SEO שכבר הוחלט
- כותרת עמוד 5b: "סי בריז (Sea Breeze) באקו", כלומר השם העברי יופיע ב‑`metaTitle` וב‑`h1`.
- כותרת 5a: "השקעות נדל״ן בבאקו".

## Interactions & Behavior
- **מזג אוויר חי:** תג הטמפרטורה בדף הבית נטען מ‑Open-Meteo (`api.open-meteo.com/v1/forecast?latitude=40.4093&longitude=49.8671&current=temperature_2m&timezone=Asia/Baku`), בלי מפתח ובלי עלות. רענון כל 30 דקות. אם הקריאה נכשלת התג פשוט לא מוצג. מומלץ לעטוף ב‑route handler עם `revalidate: 1800`.
- **פילטרים:** מסננים לפי התאמת טקסט ל‑`meta` או לתגיות. ה‑state נשמר ב‑query string.
- **שמירת מקומות (לב):** נשמרת ב‑localStorage בשלב 1.
- **RTL:** `<html dir="rtl" lang="he">` בכל האתר.
- **Responsive:** מובייל לפי `Mobile Screens`. הגריד יורד מ‑3 עמודות ל‑2 ואז ל‑1, והפילטרים עוברים ל‑bottom sheet.
- **מצבי כשל של שירותים חיצוניים:** לפי סעיף 5 במסמך ה‑API. המודול החי נעלם, והתוכן העריכתי נשאר.

## Design Tokens
**צבעים**
- כחול כהה (כותרות, ניווט): `#262A5B` · כהה יותר: `#1A1D42`
- כחול מותג (קישורים, CTA): `#1A63B8` · פעיל/קו ניווט: `#1665C1` · בהיר: `#4A94E8`, `#8FBEF2`, `#A9CDF5`
- טקסט גוף: `#2A2A30` · טקסט משני: `#6E6B78`
- רקעים וגבולות: `#FFFFFF`, `#F6F7F9`, `#EFF4FA`, `#E4EFFB`, `#E3EBF5`, `#D9E3F0`, `#DFE8F3`
- חמים ניטרלי: `#EDE9E0`, `#E6E1D6`, `#B7B0A3`, `#8C8577`
- שגיאה: `#C2402F` על `#FFF6F4` · הצלחה: `#2D7D6B`

**טיפוגרפיה (Google Fonts)**
- כותרות: **Heebo** 700/800. H1 40px/1.2 800 · H2 22px 700–800 · כותרת כרטיס 17–19px 700 · תווית עליונה 13px 700, letter-spacing .14em
- גוף: **Assistant** 400/600/700. גוף ארוך 18px/1.7–1.8 · כרטיס 14–15px/1.55–1.6 · מטא 12–13px
- נתונים ומזהים: `ui-monospace` 12–14px

**Radius:** 4, 6, 8, 10, 12, 14px · pill `999px` · עיגול `50%`
**Icons:** Material Symbols Outlined (שמות האייקונים נמצאים בשדה `icon`)

## Assets
- `design/assets/baku40-logo-skyblue.png`: **הלוגו הסופי** (תכלת). `baku40-logo.png` משמש רק בגרסה לבנה על רקע כהה (`filter: brightness(0) invert(1)`).
- `design/assets/photos/royal-casino-render.jpg`: הדמיה, חייבת תווית "הדמיה".
- `design/assets/photos/*`: תמונות העיר. **הרישיונות לא סגורים.** לפני פרסום יש לעבור על `content/image-sources.json`, ולהציג רק תמונות שהסטטוס שלהן מאושר. השאר מוצגות כ‑placeholder.
- `design/assets/photos/hotels/bk-*.webp`: תמונות מ‑Booking, לתצוגה פנימית בלבד. **לא להעלות לפרודקשן.**
- הדמיות Sea Breeze: חייבות תווית "הדמיה, לא צילום".

## Files
```
design_handoff_baku40_site/
  README.md                ← המסמך הזה
  content/*.json           ← מקור האמת לתוכן
  design/*.dc.html         ← עיצובי רפרנס (לפתוח בדפדפן)
  design/assets/           ← לוגו ותמונות
  docs/Baku40_API_Handoff_for_Claude_Code.md   ← שכבת API, שלב 2
  docs/Baku40_Screens_Status.md                ← סטטוס כל המסכים
  docs/Baku40_Kosher_Verification_Checklist.md ← בדיקות כשרות פתוחות
  docs/SEO_Spec.md         ← מפרט SEO מחייב
  docs/CMS_Spec.md         ← ממשק ניהול (TinaCMS)
```

---

## סדר עבודה
1. **שלד:** Next.js + TypeScript, RTL, פונטים, tokens, `lib/content.ts` עם ולידציה. עולה ל‑Vercel כבר בשלב הזה.
2. **תבנית ליסטינג** ו‑6 האוספים מתוך `content/`.
3. **דף הבית,** אטרקציה, מלון, מאמר, אזור.
4. **מידע למטייל,** מזג אוויר, קניות, נדל"ן (5a, 5b), עמודי SEO (9a–9c), קזינו, עמודי מערכת (אודות, משפטי, 404, קרדיטים).
5. **SEO:** כל סעיפי `docs/SEO_Spec.md`, כולל הצ׳קליסט בסעיף 10.
6. **ממשק ניהול:** TinaCMS לפי `docs/CMS_Spec.md`.
7. **מובייל:** בדיקה מול `Mobile Screens`.

בסוף כל שלב האתר צריך לעלות בלי שגיאות.

## לפני שהאתר עולה לאוויר, באחריות הבעלים
- דומיין וחיבורו ל‑Vercel.
- הרשמה לתוכנית השותפים של Booking וקבלת `BOOKING_AFFILIATE_ID`.
- תנאי שימוש, מדיניות פרטיות וגילוי נאות על עמלות, בבדיקת עורך דין.
- רישיונות לתמונות, ובינתיים placeholders.
- כשרות: שיחה עם הקהילה בבאקו (ראו `docs/Baku40_Kosher_Verification_Checklist.md`).

## איך מעדכנים אחרי שהאתר באוויר
- **תוכן ו‑SEO:** נכנסים ל‑`/admin`, עורכים ושומרים. Vercel מעלה גרסה חדשה תוך 1–2 דקות. אפשר גם להחליף קובץ ב‑`content/` דרך GitHub.
- **עיצוב:** קבצי עיצוב חדשים נכנסים ל‑`design/`, ו‑Claude Code מתבקש לעדכן לפיהם.
- **חזרה לגרסה קודמת:** בלחיצה ב‑Vercel (Deployments → Promote).

## פרומפט פתיחה ל‑Claude Code
> בנה את אתר Baku40 לפי `README.md` שבתיקייה הזו. Next.js App Router, TypeScript, RTL בעברית, העלאה ל‑Vercel.
> כל התוכן נקרא מ‑`content/*.json` דרך `lib/content.ts` עם ולידציה. אסור טקסט תוכן קשיח בקומפוננטות.
> שחזר את העיצובים ב‑`design/` בנאמנות מלאה. התחל מ‑`Baku40 Design System.dc.html`.
> יישם את `docs/SEO_Spec.md` במלואו, ואת ממשק הניהול לפי `docs/CMS_Spec.md`.
> תמונות עם "תצוגה פנימית בלבד" או בלי רישיון מוצגות כ‑placeholder. אל תמציא תוכן, רשומות או נתונים. אם חסר משהו, עצור ושאל.
> עבוד לפי "סדר עבודה", ובסוף כל שלב דווח: מה נבנה, קבצים שהשתנו, ומה פתוח.
