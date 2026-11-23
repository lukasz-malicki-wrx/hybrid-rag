"use client";

import { BarHeader } from "@hybrid-rag/ui/bar-header";
import { Heading } from "@hybrid-rag/ui/heading";
import { Composer } from "@/features/composer/composer";
import { Page } from "@/features/layout/page";
import { StartScreen } from "@/features/start/start-screen";
import { useTranslation } from "@/i18n/use-translation";
import { ComposerColumn } from "./column";
import { PendingTurn } from "./pending-turn";
import { useNewConversation } from "./use-new-conversation";

/**
 * The start of a conversation outside a group: the start screen with the message box at the
 * bottom. Once the server creates the conversation the page moves to /c/{id}, where the answer
 * keeps streaming. (Inside a group the same thing is `NewGroupConversation`.)
 */
export function NewConversation() {
  const { t } = useTranslation();
  const { composer, pending, putInComposer, openSources, aside } = useNewConversation({});
  return (
    <Page
      header={
        <BarHeader subtitle={t("chat.newIntro")}>
          <Heading level={1} size="bar" className="truncate">
            {t("chat.newHeading")}
          </Heading>
        </BarHeader>
      }
      footer={
        <ComposerColumn>
          <Composer {...composer} />
        </ComposerColumn>
      }
      aside={aside}
    >
      {!(pending.shown && pending.turnKey) && <StartScreen onExample={putInComposer} />}
      <PendingTurn {...pending} onOpenSources={openSources} className="pb-6" />
    </Page>
  );
}
