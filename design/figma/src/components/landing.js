/**
 * Landing components: apps/landing/src/components (ui and layout) and the parts of the sections.
 * Built after the core components (they are made of instances of Button, TextLink, ThemePill,
 * Badge ...) and before the landing screens, which only use instances.
 *
 *  landing/parts.js    Brand, Eyebrow, AccentParagraph, InlineCode, IconTile, ArrowLink, LinkButton,
 *                      SectionHeading, FeatureCard, Doodle, ContourPattern, StatBand, CtaBand
 *  landing/media.js    ShotFrame, ShotPair, ShotPhone, ShotCard, PageHeader
 *  landing/layout.js   SiteHeader, SiteCta, SiteFooter
 *  landing/content.js  AnswerExample, BuiltWithItem, GalleryTabs, FlowStepCard, StepListItem,
 *                      StepCard, CodeBlock, FusionTable, FaqItem
 */
import { buildParts } from "./landing/parts.js";
import { buildMedia } from "./landing/media.js";
import { buildLayout } from "./landing/layout.js";
import { buildContent } from "./landing/content.js";

export async function buildLandingComponents() {
  await buildParts();
  await buildMedia();
  await buildContent();
  await buildLayout();
}
