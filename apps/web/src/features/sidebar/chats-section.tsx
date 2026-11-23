"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { tileClass } from "@hybrid-rag/ui/tile";
import { PlusIcon } from "@hybrid-rag/ui/icons";
import { Tabs, type TabItem } from "@hybrid-rag/ui/tabs";
import { useConversations } from "@/api/conversations";
import type { Conversation } from "@/api/types";
import { useAnsweringConversationIds } from "@/hooks/use-answering-conversation";
import { useTranslation } from "@/i18n/use-translation";
import { ColumnHeader } from "./column-header";
import { ConversationCard } from "./conversation-card";
import { FilteredList } from "./filtered-list";

const title = (c: Conversation) => c.title;

type View = "all" | "saved";

/** Chats: a "new" tile, the Chats / Saved tabs, a title filter and the conversation cards. */
export function ChatsSection() {
  const { t } = useTranslation();
  const panelId = useId();
  const pathname = usePathname();
  const answeringIds = useAnsweringConversationIds();
  const all = useConversations();
  const saved = useConversations({ favorites: true });
  const [view, setView] = useState<View>("all");

  const current = view === "all" ? all : saved;
  const tabs = useMemo<TabItem<View>[]>(
    () => [
      { value: "all", label: t("sidebar.tabChats"), count: all.data?.length },
      { value: "saved", label: t("sidebar.tabSaved"), count: saved.data?.length },
    ],
    [t, all.data?.length, saved.data?.length],
  );

  return (
    <>
      <ColumnHeader
        title={t("sidebar.headingChats")}
        action={
          <Link
            href="/"
            aria-label={t("sidebar.newConversation")}
            title={t("sidebar.newConversation")}
            className={tileClass("accent")}
          >
            <PlusIcon />
          </Link>
        }
      />
      <Tabs label={t("sidebar.tabsLabel")} tabs={tabs} value={view} onChange={setView} panelId={panelId} />
      <FilteredList
        items={current.data}
        isError={current.isError}
        text={title}
        searchLabel={t("sidebar.searchChats")}
        errorMessage={t("sidebar.conversationsError")}
        emptyMessage={t(view === "all" ? "sidebar.noConversations" : "sidebar.noSaved")}
        panelProps={{ id: panelId, role: "tabpanel", "aria-label": t(view === "all" ? "sidebar.tabChats" : "sidebar.tabSaved") }}
      >
        {(items) => (
          <ul className="space-y-2">
            {items.map((c) => (
              <li key={c.id}>
                <ConversationCard conversation={c} active={pathname === `/c/${c.id}`} answering={answeringIds.includes(c.id)} />
              </li>
            ))}
          </ul>
        )}
      </FilteredList>
    </>
  );
}
