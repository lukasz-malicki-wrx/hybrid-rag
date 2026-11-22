"use client";

import { StarIcon } from "@hybrid-rag/ui/icons";
import { FAVOURITE_LIMIT, useConversations } from "@/api/conversations";
import { useAnsweringConversationIds } from "@/hooks/use-answering-conversation";
import { useTranslation } from "@/i18n/use-translation";
import { SidebarLink } from "./sidebar-link";
import { SidebarSection } from "./sidebar-section";

export function FavouritesSection() {
  const { t } = useTranslation();
  const answeringIds = useAnsweringConversationIds();
  const favourites = useConversations({ favorites: true });
  if (!favourites.data?.length) return null;
  return (
    <SidebarSection title={t("sidebar.favourites", { count: favourites.data.length, max: FAVOURITE_LIMIT })}>
      <ul>
        {favourites.data.map((c) => (
          <li key={c.id}>
            <SidebarLink href={`/c/${c.id}`} icon={<StarIcon filled className="text-accent" />} answering={answeringIds.includes(c.id)}>
              {c.title}
            </SidebarLink>
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
