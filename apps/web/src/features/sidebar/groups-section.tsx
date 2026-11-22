"use client";

import { IconButton } from "@hybrid-rag/ui/icon-button";
import { GroupIcon, PlusIcon } from "@hybrid-rag/ui/icons";
import { useGroups } from "@/api/groups";
import { useTranslation } from "@/i18n/use-translation";
import { NewGroupForm } from "./new-group-form";
import { SidebarEmpty } from "./sidebar-empty";
import { SidebarLink } from "./sidebar-link";
import { SidebarSection } from "./sidebar-section";
import { useNewGroupForm } from "./use-new-group-form";

export function GroupsSection() {
  const { t } = useTranslation();
  const groups = useGroups();
  const { open, show, close, toggleRef } = useNewGroupForm();
  return (
    <SidebarSection
      title={t("sidebar.groups")}
      action={
        <IconButton
          ref={toggleRef}
          label={t("sidebar.newGroup")}
          icon={<PlusIcon />}
          aria-expanded={open}
          onClick={open ? close : show}
          className="p-1"
        />
      }
    >
      {open && <NewGroupForm onClose={close} />}
      {groups.data?.length ? (
        <ul>
          {groups.data.map((g) => (
            <li key={g.id}>
              <SidebarLink
                href={`/g/${g.id}`}
                icon={<GroupIcon />}
                meta={<span className="text-xs text-muted">{g.conversation_count}</span>}
              >
                {g.name}
              </SidebarLink>
            </li>
          ))}
        </ul>
      ) : (
        <SidebarEmpty>{t(groups.isError ? "sidebar.groupsError" : "sidebar.noGroups")}</SidebarEmpty>
      )}
    </SidebarSection>
  );
}
