import type { ReactNode } from "react";
import { Card } from "@hybrid-rag/ui/card";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import { Screenshot } from "@/components/screenshot";
import type { ScreenshotId } from "@/config/screenshots";
import type { Locale } from "@/lib/i18n";
import { ArrowLink } from "./arrow-link";

type ShotCardProps = {
  shot: ScreenshotId;
  locale: Locale;
  /** What the picture is about: an icon and a short word, in a small row over the title. */
  meta: { icon: ReactNode; label: ReactNode };
  title: ReactNode;
  link: { href: string; label: ReactNode };
  /** The width the picture takes, as in `<img sizes>`. */
  sizes?: string;
  level?: 3 | 4;
};

/** A screenshot with its area, a title and a link: a card of the app's gallery. A list item: put it in a <ul>. */
export function ShotCard({ shot, locale, meta, title, link, sizes = "(min-width: 1024px) 384px, 100vw", level = 3 }: ShotCardProps) {
  return (
    <Card as="li" className="flex flex-col gap-4 p-4">
      <div className="overflow-hidden rounded-lg border border-border">
        <Screenshot id={shot} locale={locale} sizes={sizes} />
      </div>
      <Text as="div" size="sm" tone="muted" className="flex items-center gap-2">
        {meta.icon}
        {meta.label}
      </Text>
      <Heading level={level} size="md" className="text-pretty">
        {title}
      </Heading>
      <ArrowLink href={link.href} className="mt-auto self-start">
        {link.label}
      </ArrowLink>
    </Card>
  );
}
