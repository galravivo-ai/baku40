# Baku40: ממשק ניהול תוכן (שלב 1)

## בחירה
**TinaCMS** (או Decap CMS כחלופה חינמית לגמרי). ממשק ניהול בכתובת `/admin`, שעורך ישירות את קבצי `content/*.json` במאגר GitHub. אין מסד נתונים. שמירה ⇒ commit ⇒ Vercel בונה מחדש תוך 1–2 דקות.
העיצוב והזרימה של הממשק: `design/Baku40 CMS.dc.html` (6a–6e). בשלב 1 בונים את מה שהכלי מאפשר. הרשאות מתקדמות, סטטוסי אימות וייבוא API נשארים לשלב 2 (Payload).

## התחברות
- משתמש אחד או יותר לפי אימייל. אין גישה ציבורית ל‑`/admin`.
- `/admin` חסום ב‑robots וב‑`noindex`.

## אוספים בממשק
| אוסף | קובץ | פעולות |
|---|---|---|
| הגדרות אתר | `site.json` | עריכה |
| מלונות | `hotels.json` | הוספה, עריכה, מחיקה, גרירה לסידור |
| מסעדות | `restaurants.json` | כנ״ל |
| כשר | `kosher.json` | כנ״ל |
| מסלולים | `itineraries.json` | כנ״ל |
| קניות | `shopping.json` | כנ״ל |
| טיולי יום | `day-trips.json` | כנ״ל |
| אזורים | `areas.json` | כנ״ל |
| אטרקציות | `attractions.json` | כנ״ל |
| הפניות | `redirects.json` | עריכה (בנוסף, נוצרות אוטומטית בשינוי slug) |

## שדות

**ברמת אוסף:** `h1`, `intro`, `crumbs`, `filterGroups`, `box.title`, `box.text`.
ובלשונית **SEO**: `metaTitle`, `metaDescription`, `canonical`, `ogImage`, `ogImageAlt`, `robots`, `editorialHeading`, `editorialBody`.

**ברמת רשומה**
- **תוכן:** `name`, `meta`, `text` (חובה), `foot`, `icon`, `badge`, `cta`.
- **מיקום:** `area` (בחירה מרשימת האזורים), שממלא אוטומטית את `areaSlug`.
- **תמונה:** `photo` (העלאה), `photoAlt` (חובה אם יש תמונה), `photoNote`, `photoLicense` (בחירה: מורשה, תצוגה פנימית, הדמיה). רק "מורשה" מוצגת בפרודקשן.
- **אימות:** `verify`, `verifiedAt` (תאריך), `source` (URL).
- **מלונות בלבד:** `score`, `reviews`, `stars`, `bookingUrl`.
- **לשונית SEO:** `slug` (נוצר מהשם, ניתן לעריכה), `seo.metaTitle`, `seo.metaDescription`, `seo.noindex`.

## עזרי SEO בממשק
- מונה תווים ל‑`metaTitle` (עד 65) ול‑`metaDescription` (עד 155), עם צבע אזהרה.
- תצוגה מקדימה של תוצאת גוגל: כותרת, כתובת ותיאור.
- אזהרה על כותרת או תיאור כפולים לרשומה אחרת.
- אזהרה על תמונה בלי `alt`, ועל עמוד עם פחות מ‑150 מילים.
- שינוי `slug` מוסיף הפניה ל‑`redirects.json`.

## ולידציה (גם בממשק וגם ב‑build)
- `name` ו‑`text` חובה. מלון בלי `text` לא נשמר.
- `slug` ייחודי באוסף.
- `photoLicense` חובה אם יש `photo`.
- `bookingUrl` חייב להתחיל ב‑`https://www.booking.com/`.

## מיון
- מלונות: לפי `reviews` בסדר יורד, אוטומטית. אפשר "להצמיד" רשומה למעלה עם `pinned: true`.
- שאר האוספים: לפי הסדר בממשק (גרירה).
