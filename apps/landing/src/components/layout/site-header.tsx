import { buttonClass } from "@hybrid-rag/ui/button";
import { RepoIcon } from "@hybrid-rag/ui/icons";
import { SITE } from "@/config/site";
import { otherLocale, type Locale } from "@/lib/i18n";
import { NAV, pagePath } from "@/lib/routes";
import { getTranslator } from "@/lib/translator";
import { Container } from "../ui/container";
import { Brand } from "./brand";
import { LanguageSwitch } from "./language-switch";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, type NavEntryView, type NavItem } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/** The header of every page: the brand, the pages in the middle, and the language, the theme and GitHub on the right. */
export function SiteHeader({ locale }: { locale: Locale }) {
  const { t } = getTranslator(locale);
  const item = (id: NavItem["id"]): NavItem => ({ id, href: pagePath(id, locale), label: t(`common.pages.${id}`) });
  const entries: NavEntryView[] = NAV.map((entry) =>
    entry.kind === "page"
      ? { kind: "page", ...item(entry.id) }
      : { kind: "menu", id: entry.id, label: t(`common.header.${entry.id}`), items: entry.pages.map(item) },
  );
  const language = <LanguageSwitch locale={locale} name={t(`common.languages.${otherLocale(locale)}`)} />;
  const theme = (
    <ThemeToggle switchToLight={t("common.header.switchToLight")} switchToDark={t("common.header.switchToDark")} />
  );
  const github = (size: "md" | "sm", className?: string) => (
    <a href={SITE.repo} aria-label={t("common.header.githubLabel")} className={buttonClass({ variant: "secondary", size, className })}>
      <RepoIcon />
      {t("common.header.github")}
    </a>
  );
  return (
    <header className="relative z-30 bg-bg shadow-header">
      <Container className="flex min-h-20 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2 lg:grid lg:min-h-25 lg:grid-cols-[1fr_auto_1fr] lg:flex-nowrap">
        <Brand locale={locale} label={t("common.homeLink")} />
        <nav aria-label={t("common.header.navLabel")} className="hidden lg:block">
          <NavLinks entries={entries} direction="row" />
        </nav>
        <div className="hidden items-center justify-end gap-3 lg:flex">
          {language}
          {theme}
          {github("md")}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {github("sm")}
          <MobileMenu label={t("common.header.menu")}>
            <nav aria-label={t("common.header.menuNavLabel")}>
              <NavLinks entries={entries} direction="column" />
            </nav>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border px-1 pt-3">
              {language}
              {theme}
            </div>
          </MobileMenu>
        </div>
      </Container>
    </header>
  );
}
