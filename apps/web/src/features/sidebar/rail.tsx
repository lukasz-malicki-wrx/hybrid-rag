"use client";

import Link from "next/link";
import { memo } from "react";
import { tileClass } from "@hybrid-rag/ui/tile";
import { ChatIcon, FileIcon, GroupIcon, SearchIcon, SparklesIcon } from "@hybrid-rag/ui/icons";
import { LanguageSwitcher } from "@/features/settings/language-switcher";
import { SettingsButton } from "@/features/settings/settings-button";
import { useTranslation } from "@/i18n/use-translation";
import { RailItem } from "./rail-item";
import { ThemeSwitch } from "./theme-switch";
import { useRouteSection } from "./use-route-section";

/** The 64px icon rail: the logo, one item per section and the search lab, then settings, language and theme. */
export const Rail = memo(function Rail() {
  const { t } = useTranslation();
  const { active, pick } = useRouteSection();
  return (
    <div className="flex w-16 shrink-0 flex-col items-center border-r border-border pb-4 pt-4">
      <Link
        href="/"
        aria-label={t("app.name")}
        title={t("app.name")}
        className={tileClass("accent")}
      >
        <SparklesIcon />
      </Link>
      <nav aria-label={t("rail.label")} className="mt-16 flex w-full flex-col items-center gap-6">
        <RailItem label={t("rail.chats")} icon={<ChatIcon />} active={active === "chats"} onSelect={() => pick("chats")} />
        <RailItem label={t("rail.groups")} icon={<GroupIcon />} active={active === "groups"} onSelect={() => pick("groups")} />
        <RailItem
          label={t("rail.documents")}
          icon={<FileIcon />}
          active={active === "documents"}
          onSelect={() => pick("documents")}
        />
        <RailItem label={t("rail.searchLab")} icon={<SearchIcon />} active={active === "search"} href="/search" />
      </nav>
      <div className="mt-auto flex flex-col items-center gap-3">
        <SettingsButton />
        <LanguageSwitcher />
        <hr className="my-1 w-8 border-border" />
        <ThemeSwitch />
      </div>
    </div>
  );
});
