"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@hybrid-rag/ui/cn";
import { IconButton } from "@hybrid-rag/ui/icon-button";
import { GroupIcon, PlusIcon } from "@hybrid-rag/ui/icons";
import { useGroups } from "@/api/groups";
import type { Group } from "@/api/types";
import { useTranslation } from "@/i18n/use-translation";
import { ColumnHeader } from "./column-header";
import { FilteredList } from "./filtered-list";
import { NewGroupForm } from "./new-group-form";
import { useNewGroupForm } from "./use-new-group-form";

const groupName = (g: Group) => g.name;

/** Groups: the new group form behind "+", a name filter and the groups with their conversation counts. */
export function GroupsSection() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const groups = useGroups();
  const { open, show, close, toggleRef } = useNewGroupForm();

  return (
    <>
      <ColumnHeader
        title={t("sidebar.headingGroups")}
        action={
          <IconButton
            ref={toggleRef}
            variant="accent"
            label={t("sidebar.newGroup")}
            title={t("sidebar.newGroup")}
            icon={<PlusIcon />}
            aria-expanded={open}
            onClick={open ? close : show}
          />
        }
      />
      {open && <NewGroupForm onClose={close} />}
      <FilteredList
        items={groups.data}
        isError={groups.isError}
        text={groupName}
        searchLabel={t("sidebar.searchGroups")}
        errorMessage={t("sidebar.groupsError")}
        emptyMessage={t("sidebar.noGroups")}
      >
        {(items) => (
          <ul className="space-y-1">
            {items.map((g) => {
              const href = `/g/${g.id}`;
              const active = pathname === href;
              return (
                <li key={g.id}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm text-fg hover:bg-surface-2",
                      active && "bg-surface-2 font-semibold",
                    )}
                  >
                    <GroupIcon width={12} height={12} className="shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{g.name}</span>
                    <span className="shrink-0 text-xs text-muted">{g.conversation_count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </FilteredList>
    </>
  );
}
