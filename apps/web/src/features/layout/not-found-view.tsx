"use client";

import Link from "next/link";
import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Heading } from "@hybrid-rag/ui/heading";
import { Text } from "@hybrid-rag/ui/text";
import type { MessageKey } from "@/i18n/messages";
import { useTranslation } from "@/i18n/use-translation";
import { Page } from "./page";

type Props = { title: MessageKey; hint?: MessageKey; linkLabel?: MessageKey };

export function NotFoundView({ title, hint, linkLabel = "chat.startNew" }: Props) {
  const { t } = useTranslation();
  return (
    <Page
      header={
        <BarHeader>
          <Heading level={1} size="bar" className="truncate">
            {t(title)}
          </Heading>
        </BarHeader>
      }
    >
      <div className="p-6">
        {hint && (
          <Text tone="muted" className="mb-4">
            {t(hint)}
          </Text>
        )}
        <Link
          href="/"
          className="inline-flex min-h-8 items-center rounded-lg text-accent underline"
        >
          {t(linkLabel)}
        </Link>
      </div>
    </Page>
  );
}
