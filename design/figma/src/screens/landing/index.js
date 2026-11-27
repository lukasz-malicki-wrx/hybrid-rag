/**
 * The landing page of the file: one row per page, each with a desktop (1440) and a phone (375)
 * screen in light and dark. Every screen is made of instances of the landing components, layout
 * frames and texts. The pages mirror apps/landing/src/app/[locale]/<page>/page.tsx.
 */
import { screenRow } from "../../lib/pages.js";
import { faqPage } from "./faq.js";
import { featuresPage } from "./features.js";
import { homePage } from "./home.js";
import { howPage } from "./how.js";

const PAGES = [
  ["Home", homePage],
  ["Features", featuresPage],
  ["How it works", howPage],
  ["FAQ", faqPage],
];

export async function buildLandingScreens(page, place) {
  for (const [title, build] of PAGES) {
    await screenRow(page, place, title, [
      { name: `${title} / Desktop`, build: () => build("desktop") },
      { name: `${title} / Mobile`, build: () => build("mobile") },
    ]);
  }
}
