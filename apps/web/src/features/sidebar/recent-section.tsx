"use client";

import { ChatIcon } from "@hybrid-rag/ui/icons";
import { useConversations } from "@/api/conversations";
import { useAnsweringConversationIds } from "@/hooks/use-answering-conversation";
import { useTranslation } from "@/i18n/use-translation";
import { SidebarEmpty } from "./sidebar-empty";
import { SidebarLink } from "./sidebar-link";
import { SidebarSection } from "./sidebar-section";

const SHOWN = 20;

export function RecentSection() {
  const { t } = useTranslation();
  const answeringIds = useAnsweringConversationIds();
  const recent = useConversations();
  return (
    <SidebarSection title={t("sidebar.recent")}>
      {recent.data?.length ? (
        <ul>
          {recent.data.slice(0, SHOWN).map((c) => (
            <li key={c.id}>
              <SidebarLink href={`/c/${c.id}`} icon={<ChatIcon />} answering={answeringIds.includes(c.id)}>
                {c.title}
              </SidebarLink>
            </li>
          ))}
        </ul>
      ) : (
        <SidebarEmpty>{t(recent.isError ? "sidebar.conversationsError" : "sidebar.noConversations")}</SidebarEmpty>
      )}
    </SidebarSection>
  );
}
