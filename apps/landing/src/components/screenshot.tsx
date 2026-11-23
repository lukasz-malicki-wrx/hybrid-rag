import { getImageProps } from "next/image";
import { PictureIcon } from "@hybrid-rag/ui/icons";
import { SCREENSHOTS, type ScreenshotId } from "@/config/screenshots";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/translator";

type ScreenshotProps = {
  id: ScreenshotId;
  locale: Locale;
  /**
   * Set on the one screenshot that is the largest thing visible when the page loads (LCP): it
   * loads at once with high fetch priority (next/image `priority` is deprecated). Others load
   * lazily, near the viewport.
   */
  eager?: boolean;
  /** Width the picture takes at each breakpoint, as in `<img sizes>`. Default: the page width, full on phones. */
  sizes?: string;
};

const DEFAULT_SIZES = "(min-width: 1152px) 1088px, 100vw";

/**
 * A screenshot of the app from `config/screenshots.ts`. Without a file it is a placeholder with
 * the same aspect ratio (so nothing moves when the real image arrives), exposed as an image with
 * its description. With files it is a <picture> whose source follows the device's theme, so a
 * visitor downloads one image, not both. A theme chosen on the site (data-theme) that differs from
 * the device's cannot change a <picture>: CSS then hides it and shows one of the two lazy
 * fallbacks instead (`.shot-auto`, `.shot-forced-*` in globals.css). All three carry the
 * description; the hidden ones (display: none) are not read out.
 */
export function Screenshot({ id, locale, eager = false, sizes = DEFAULT_SIZES }: ScreenshotProps) {
  const entry = SCREENSHOTS[id];
  const { t } = getTranslator(locale);
  const alt = t(`screenshots.${id}`);
  if (entry.src) {
    const common = { alt, width: entry.width, height: entry.height, sizes, className: "h-auto w-full" };
    const loading = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : ({ loading: "lazy" } as const);
    const light = getImageProps({ ...common, ...loading, src: entry.src.light }).props;
    const dark = getImageProps({ ...common, ...loading, src: entry.src.dark }).props;
    const lazy = (src: string) => getImageProps({ ...common, loading: "lazy", src }).props;
    return (
      <div className="screenshot">
        <picture className="shot-auto">
          <source media="(prefers-color-scheme: dark)" srcSet={dark.srcSet} sizes={dark.sizes} />
          {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps gives the optimised src, srcSet and alt */}
          <img {...light} />
        </picture>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- as above */}
        <img {...lazy(entry.src.light)} className="shot-forced shot-forced-light h-auto w-full" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- as above */}
        <img {...lazy(entry.src.dark)} className="shot-forced shot-forced-dark h-auto w-full" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${entry.width} / ${entry.height}` }}
      className="screenshot flex w-full flex-col items-center justify-center gap-2 bg-surface-2 p-4 text-center text-sm text-muted"
    >
      <PictureIcon width={28} height={28} />
      <span>{t("screenshots.placeholder", { name: t(`screenshots.names.${id}`) })}</span>
    </div>
  );
}
