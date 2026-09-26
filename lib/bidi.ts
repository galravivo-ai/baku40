// Minimal visual reordering for a right-to-left line, for renderers without
// bidi support (next/og / Satori). Hebrew words are reversed and brackets
// mirrored; runs of Latin/number words keep their internal order.

const HEBREW = /[֐-׿]/;
const MIRROR: Record<string, string> = { "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "«": "»", "»": "«" };

function mirror(s: string) {
  return [...s].map((c) => MIRROR[c] ?? c).join("");
}

/** Visual (left-to-right) order of one logical RTL line. */
export function visualRtl(line: string): string {
  const words = line.split(/\s+/).filter(Boolean);
  type Run = { ltr: boolean; words: string[] };
  const runs: Run[] = [];
  for (const w of words) {
    const ltr = !HEBREW.test(w) && /[A-Za-z0-9]/.test(w);
    const last = runs[runs.length - 1];
    if (last && last.ltr === ltr) last.words.push(w);
    else runs.push({ ltr, words: [w] });
  }
  return runs
    .reverse()
    .map((r) => {
      if (!r.ltr) return r.words.map((w) => mirror([...w].reverse().join(""))).reverse().join(" ");
      // Keep the Latin run as is, but brackets at its edges belong to the RTL flow.
      const text = r.words.join(" ");
      const m = text.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$/)!;
      return mirror(m[3].split("").reverse().join("")) + m[2] + mirror(m[1].split("").reverse().join(""));
    })
    .join(" ");
}

/** Break a logical string into lines of at most `max` characters (word boundaries). */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (cur && (cur + " " + w).length > max) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? `${cur} ${w}` : w;
  }
  if (cur) lines.push(cur);
  return lines;
}
