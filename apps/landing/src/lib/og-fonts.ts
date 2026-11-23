import { readFile } from "node:fs/promises";
import path from "node:path";

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");

/**
 * Inter at the two weights the cards use, as TrueType (the format the image renderer reads; the
 * site's own font is WOFF2, which it cannot). Both files are Latin plus Latin Extended-A, so
 * Polish letters (ą ć ę ł ń ó ś ź ż) are drawn in Inter and not in a fallback.
 */
export async function loadOgFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(path.join(FONT_DIR, "inter-og-400.ttf")),
    readFile(path.join(FONT_DIR, "inter-og-600.ttf")),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}
