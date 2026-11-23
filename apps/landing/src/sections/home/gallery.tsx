import { ArrowRightIcon, ChatIcon, CheckIcon, FileIcon, GroupIcon } from "@hybrid-rag/ui/icons";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShotCard } from "@/components/ui/shot-card";
import { pagePath } from "@/lib/routes";
import { GALLERY_AREAS, GALLERY_CARDS, type GalleryCardArea } from "./gallery-data";
import { GalleryFilter } from "./gallery-filter";
import type { HomeSectionProps } from "./props";

const AREA_ICON: Record<GalleryCardArea, React.ReactNode> = {
  chat: <ChatIcon width={18} height={18} aria-hidden="true" />,
  sources: <FileIcon width={18} height={18} aria-hidden="true" />,
  documents: <GroupIcon width={18} height={18} aria-hidden="true" />,
  quality: <CheckIcon width={18} height={18} aria-hidden="true" />,
};

/** "See the app": screenshots by area, filtered by tabs. The cards are made here, on the server. */
export function Gallery({ t, locale }: HomeSectionProps) {
  const cards = GALLERY_CARDS.map(({ id, shot, area, group }) => ({
    id,
    area,
    node: (
      <ShotCard
        key={id}
        shot={shot}
        locale={locale}
        meta={{ icon: AREA_ICON[area], label: t(`home.gallery.areas.${area}`) }}
        title={t(`home.gallery.cards.${id}.title`)}
        link={{ href: `${pagePath("features", locale)}#${group}`, label: t(`home.gallery.cards.${id}.link`) }}
      />
    ),
  }));
  return (
    <section aria-labelledby="home-gallery" className="surface-panel pb-section">
      <Container>
        <SectionHeading
          id="home-gallery"
          eyebrow={t("home.gallery.eyebrow")}
          title={t("home.gallery.title")}
          align="center"
          className="mb-heading"
        />
        <GalleryFilter
          label={t("home.gallery.tabsLabel")}
          tabs={GALLERY_AREAS.map((value) => ({ value, label: t(`home.gallery.areas.${value}`) }))}
          cards={cards}
        />
        <div className="mt-15 flex justify-center">
          <LinkButton href={pagePath("features", locale)} variant="primary">
            {t("home.gallery.cta")}
            <ArrowRightIcon />
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
