import "server-only";

// Live temperature for the home badge (Open-Meteo, no key). Cached for 30
// minutes; on any failure the badge is simply not shown.
const URL_BAKU =
  "https://api.open-meteo.com/v1/forecast?latitude=40.4093&longitude=49.8671&current=temperature_2m&timezone=Asia%2FBaku";

export async function getBakuTemperature(): Promise<string | null> {
  try {
    const res = await fetch(URL_BAKU, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { current?: { temperature_2m?: unknown } };
    const t = data.current?.temperature_2m;
    return typeof t === "number" ? `${Math.round(t)}°` : null;
  } catch {
    return null;
  }
}
