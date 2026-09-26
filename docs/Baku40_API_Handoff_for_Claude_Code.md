# Baku40 — מסמך מסירה: חיבור API בפועל
גרסה 1.0 · 18.9.2026
נלווה ל‑`Baku40_External_Data_API_Integration_Spec_v1.md`. המסמך הזה לא מחליף אותו — הוא מתרגם אותו לקבצים, נתיבים וסדר עבודה.

---

## 0. עקרון שלא נשבר

הדפדפן לא מדבר עם שום ספק חיצוני. הוא מדבר רק עם `/api/*` שלנו. השרת מדבר עם הספקים.

```
Browser → /api/* (Next route handler) → Provider Adapter → External API
                                     ↘ PostgreSQL / cache
```

סיבות: מפתחות לא נחשפים, אפשר לעשות cache ורייט‑לימיט, ואפשר להחליף ספק בלי לשנות UI.

---

## 1. חשבונות ומפתחות — מה צריך להשיג

| ספק | מה פותחים | מה מקבלים | הערות |
|---|---|---|---|
| Google Cloud | פרויקט + הפעלת **Places API (New)** ו‑**Maps JavaScript API** | `GOOGLE_MAPS_API_KEY` | שני מפתחות נפרדים: אחד לשרת (Places, בלי הגבלת Referrer) ואחד לדפדפן (Maps, מוגבל לדומיין). חיוב חייב להיות מופעל. |
| Booking.com | בקשת גישה ל‑**Demand API** דרך תוכנית השותפים | `BOOKING_API_KEY`, `BOOKING_AFFILIATE_ID` | תהליך אישור, לא הרשמה מיידית. להתחיל בבקשה מוקדם — זה צוואר הבקבוק של Milestone 4. |
| Mapbox | חשבון + Access Token | `MAPBOX_ACCESS_TOKEN` | טוקן ציבורי מוגבל ל‑URL. אם בוחרים Google Maps כשכבת המפה — לדלג. |
| Open‑Meteo | כלום | — | ללא מפתח. אם עוברים לספק אחר: `WEATHER_API_KEY`. |
| OSM / Overpass | כלום | — | **אסור** בקריאות פר משתמש. Job מתוזמן בלבד. אם הנפח גדל — Overpass מתארח/בתשלום. |
| Nominatim | כלום | — | לא לשימוש ב‑autocomplete. גיאוקודינג נקודתי בלבד, עם User‑Agent מזהה. |

---

## 2. משתני סביבה

```env
# Google
GOOGLE_PLACES_API_KEY=            # שרת בלבד
NEXT_PUBLIC_GOOGLE_MAPS_KEY=      # דפדפן, מוגבל דומיין

# Booking
BOOKING_API_KEY=
BOOKING_AFFILIATE_ID=
BOOKING_API_BASE_URL=https://demandapi.booking.com/3.2

# Map / Weather / OSM
NEXT_PUBLIC_MAPBOX_TOKEN=
WEATHER_API_BASE_URL=https://api.open-meteo.com/v1
OSM_OVERPASS_URL=
NOMINATIM_URL=
NOMINATIM_USER_AGENT=Baku40/1.0 (contact@domain.co.il)

# Core
DATABASE_URL=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=
```

רק `NEXT_PUBLIC_*` מגיעים לדפדפן. כל השאר שרת בלבד. אין מפתח ב‑git.

---

## 3. מבנה קבצים

```
/packages/providers
  types.ts                 # ExternalProvider, NormalizedPlaceData, ProviderSyncState
  registry.ts              # מחזיר adapter לפי שם ספק
  google/places.ts
  google/photos.ts
  osm/overpass.ts
  osm/nominatim.ts
  booking/availability.ts
  booking/metadata.ts
  map/mapbox.ts            # routes + matrix
  weather/openMeteo.ts
  matching/score.ts        # שם + מרחק + כתובת + דומיין
  matching/dedupe.ts
  cache.ts                 # מפתח: provider:endpoint:entity:paramsHash:locale

/apps/web/app/api
  places/search/route.ts         # אדמין בלבד
  places/[id]/details/route.ts
  places/[id]/photos/route.ts
  hotels/availability/route.ts   # POST: dates + occupancy
  route/directions/route.ts
  weather/current/route.ts
  import/overpass/route.ts       # אדמין בלבד, מפעיל job

/apps/cms/collections/fields
  externalIds.ts
  externalSync.ts
  fieldOwnership.ts
  provenance.ts

/apps/cms/jobs
  osmDiscoveryImport.ts
  refreshEntityExternalLinks.ts
  bookingMetadataRefresh.ts
  staleSourceReminder.ts
  rebuildRelatedEntities.ts
```

---

## 4. טיפוסים מחייבים

```ts
type FieldMode = "MANUAL" | "AUTO" | "AUTO_WITH_OVERRIDE";

type Provenance = {
  provider: "google" | "osm" | "booking" | "official";
  externalId?: string;
  fetchedAt: string;      // ISO
};

type ExternalValue<T> = {
  manual?: T;             // מה שהעורך כתב
  external?: T;           // מה שהספק החזיר
  mode: FieldMode;
  provenance?: Provenance;
};

// כלל הקריאה — יחיד, במקום אחד בקוד:
function resolve<T>(v: ExternalValue<T>): T | undefined {
  return v.mode === "AUTO" ? (v.external ?? v.manual) : (v.manual ?? v.external);
}
```

ה‑Frontend קורא רק ל‑`resolve`. אין גישה ישירה ל‑`external`.

---

## 5. נתיבי API — חוזה

### `POST /api/hotels/availability`
גוף: `{ hotelId, checkIn, checkOut, adults, children, rooms }`
מחזיר: `{ status: "available" | "unavailable" | "provider_down", price?, currency?, fetchedAt, redirectUrl? }`
כלל: **בלי תאריכים ותפוסה אין קריאה ואין מחיר.** `provider_down` מציג בעמוד "מחיר וזמינות אינם זמינים כרגע" — ולא מחיר משוער. Cache קצר מועד בלבד, לפי תנאי הספק.

### `GET /api/places/[id]/details`
שרת שולף Place Details עם FieldMask מצומצם: `id,displayName,formattedAddress,location,nationalPhoneNumber,websiteUri,regularOpeningHours,rating,userRatingCount,googleMapsUri,businessStatus,primaryType`.
Place ID נשמר ב‑DB. שאר השדות לא נשמרים כמאגר קבוע.

### `GET /api/places/[id]/photos`
נשלף בזמן רינדור הגלריה, מחזיר גם `authorAttributions`. הייחוס מוצג. לא נשמר כנכס CMS.

### `POST /api/import/overpass`
אדמין בלבד. מכניס job לתור, לא מחזיר תוצאות סינכרוניות. התוצאות עוברות `normalize` → `dedupe` → מועמדים → אישור עורך → יצירת **DRAFT**.

### `GET /api/weather/current`
Cache 15–60 דקות. נתוני `WeatherMonth` העריכתיים לא נוגעים בזה.

### `POST /api/route/directions`
`{ from, to, profile: "walking" | "driving" }`. אסור להחזיר מרחק אווירי ולקרוא לו זמן נסיעה.

---

## 6. סדר עבודה — Milestones

**M1 · תשתית**
טיפוסים, `ExternalValue`, `externalIds`, `externalSync`, `fieldOwnership`, `provenance`, registry, cache, `resolve`. בלי אף ספק אמיתי. בדיקה: ישות נשמרת ונקראת, override ידני נשמר בנפרד מהערך החיצוני.

**M2 · OSM**
בונה שאילתה, `normalize`, `dedupe`, מסך מועמדים (מסך 12b בעיצוב), ייבוא כטיוטה, ייחוס "© OpenStreetMap contributors" בכל מפה. בדיקה: אין אף קריאת Overpass בבקשת משתמש.

**M3 · Google Places**
חיפוש מקום באדמין, ניקוד התאמה, אישור ידני, שמירת Place ID, Place Details חי, תמונות עם ייחוס. בדיקה: אין חיבור אוטומטי לפי שם בלבד.

**M4 · Booking**
מיפוי מלון, טופס תאריכים, זמינות ומחיר, CTA להפניה, מצב כשל. בדיקה: בלי תאריכים אין קריאה; המפתח לא מופיע ב‑bundle.

**M5 · מפה, מסלולים, מזג אוויר**
שכבת מפה בטעינה עצלה, Directions, זמני מעבר למתכנן, תחזית חיה. בדיקה: המפה לא נטענת עד שהרכיב נכנס למסך.

**M6 · ניטור וציות**
לוגים לכל ספק, מכסות, jobs שנכשלו, תזכורות אימות שפג (מסך 12c). בדיקה: כל ערך חיצוני נושא provenance.

האפליקציה חייבת לעלות בסוף כל Milestone.

---

## 7. צ׳ק ליסט בדיקה לכל ספק

**Google**
- [ ] מפתח השרת לא מופיע ב‑bundle של הדפדפן
- [ ] FieldMask מצומצם, בלי שדות שלא בשימוש
- [ ] Place ID נשמר; שעות/דירוג/תמונות לא נשמרים כמאגר קבוע
- [ ] ייחוס צילום מוצג כשהוחזר
- [ ] כשל → המודול החי נעלם, התוכן העריכתי נשאר

**OSM / Overpass**
- [ ] אפס קריאות פר משתמש
- [ ] Job שבועי, idempotent, עם retry ו‑backoff
- [ ] ייבוא יוצר DRAFT בלבד
- [ ] ייחוס מוצג בכל מפה
- [ ] dedupe לפי OSM ID + Place ID + שם + מרחק

**Booking**
- [ ] מפתח בצד שרת בלבד
- [ ] קריאה רק אחרי תאריכים ותפוסה
- [ ] מחיר מוצג עם חותמת זמן, בלי עיגול
- [ ] קישור שותפים מסומן בגילוי נאות
- [ ] כשל → "מחיר וזמינות אינם זמינים כרגע"

**מפה ומסלולים**
- [ ] טעינה עצלה
- [ ] קרדיט ספק על המפה, לא מוסר
- [ ] זמן נסיעה מחושב, לא מוערך

**מזג אוויר**
- [ ] תחזית חיה מופרדת מ‑`WeatherMonth`
- [ ] Cache 15–60 דקות
- [ ] כשל → התוכן העריכתי החודשי נשאר

**אימות רשמי**
- [ ] שעות, מחירים, ויזה ותחבורה — רק מול מקור רשמי
- [ ] `officialSourceUrl` + `lastVerifiedAt` + `verifiedBy` מלאים
- [ ] פרסום חסום בתוכן רגיש לזמן בלי אימות

---

## 8. מה שלא מתחבר ל‑API — בכוונה

חיפוש באתר עובד מול המאגר שלנו, לא מול Google. תיאורים, "למי מתאים", טיפים, יתרונות ושיקולים — עריכתיים בלבד. תמונת הירו — בבעלותנו או ברישיון. דירוגים וביקורות — לא מייצרים `aggregateRating` בסכימה. מועמד שיובא אינו עמוד ציבורי.

---

## 9. הפרומפט ל‑Claude Code

> יישם את שכבת ה‑API של Baku40 לפי `Baku40_External_Data_API_Integration_Spec_v1.md` ומסמך המסירה הזה.
> התחל ב‑M1 במלואו לפני שאתה נוגע בספק אמיתי: טיפוסים, `ExternalValue`, `resolve`, שדות ה‑ID, בעלות על שדה ו‑provenance.
> הדפדפן קורא רק ל‑`/api/*` שלנו. אף מפתח ספק לא מגיע ל‑bundle.
> Overpass רק ב‑job מתוזמן. Nominatim לא ב‑autocomplete. Booking רק אחרי תאריכים ותפוסה. Place ID נשמר, תוכן Google לא נשמר כמאגר קבוע.
> ייבוא יוצר DRAFT. ערך ידני מנצח ערך אוטומטי. כשל ספק מסתיר מודול ולא שובר עמוד.
> אל תמציא שדות או endpoints — עבוד מול התיעוד הנוכחי של הספק בזמן המימוש, ואם שדה לא קיים, עצור ודווח.
> בסוף כל Milestone: קבצים שהשתנו, שינויי מודל, נתיבים, משתני סביבה, מיגרציות, צ׳ק ליסט בדיקה ושאלות פתוחות.
