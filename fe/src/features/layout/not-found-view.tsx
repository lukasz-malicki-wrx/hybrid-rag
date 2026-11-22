"use client";

import Link from "next/link";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import type { MessageKey } from "@/i18n/messages";
import { useTranslation } from "@/i18n/use-translation";

type Props = { title: MessageKey; hint?: MessageKey; linkLabel?: MessageKey };

export function NotFoundView({ title, hint, linkLabel = "chat.startNew" }: Props) {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <Heading level={1}>{t(title)}</Heading>
      {hint && (
        <Text tone="muted" className="mt-1">
          {t(hint)}
        </Text>
      )}
      <Link href="/" className="mt-4 inline-block text-accent underline">
        {t(linkLabel)}
      </Link>
    </div>
  );
}
