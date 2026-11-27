/**
 * Landing components, part 3: the page frame (apps/landing/src/components/layout).
 * SiteHeader (nav-links, nav-menu, mobile-menu, language-switch, theme-toggle, brand),
 * SiteCta (site-cta) and SiteFooter (site-footer).
 */
import { boolProp, component, instance, setProps, setup } from "../../lib/components.js";
import { add, frame, shadow, size, text } from "../../lib/layout.js";
import { icon, tintIcon } from "../../lib/icons.js";
import { layoutSpace, paint } from "../../lib/tokens.js";
import { LOCALE, tl, tlRaw } from "../../lib/text.js";
import { listOf, variantSet } from "../core/shared.js";
import { AUTHOR, BP, dimStroke, MARGIN, PAGE_W, sideStroke } from "./shared.js";

const PATH = "apps/landing/src/components/layout";

// ---------------------------------------------------------------------------------------------
// SiteHeader

/** Which header entry is the current page: "product" holds three pages. */
const CURRENT = ["home", "features", "how-it-works", "faq", "none"];
const IN_PRODUCT = ["features", "how-it-works", "faq"];

function page(id) {
  return tl("common", `pages.${id}`);
}

/** A page link of the header: the quiet button, underlined in the foreground colour when it is the current page. */
function pageLink(label, size_, current, o = {}) {
  const b = instance("Button", { variant: "quiet", size: size_, state: "default", Label: label });
  if (o.chevron) {
    setProps(b, { "Icon right": true });
    setProps(b, { "Icon right": "ChevronDown" });
  }
  if (current) {
    const t = b.findOne((n) => n.type === "TEXT");
    t.fills = [paint("fg")];
    t.textDecoration = "UNDERLINE";
    const chevron = b.findOne((n) => n.name === "Icon right");
    if (chevron) tintIcon(chevron, "fg");
  }
  return b;
}

function languageSwitch() {
  const b = instance("Button", { variant: "quiet", size: "sm", state: "default", Label: tl("common", `languages.${LOCALE === "pl" ? "en" : "pl"}`) });
  setProps(b, { "Icon left": true });
  setProps(b, { "Icon left": "Languages" });
  return b;
}

function github(size_) {
  const b = instance("Button", { variant: "secondary", size: size_, state: "default", Label: tl("common", "header.github") });
  setProps(b, { "Icon left": true });
  setProps(b, { "Icon left": "Repo" });
  return b;
}

function themePill() {
  return instance("ThemePill", { orientation: "horizontal", dark: "false" });
}

function menuButton(open) {
  const b = frame("Menu button", { dir: "row", align: "center", justify: "center", w: 40, h: 40, radius: "lg", stroke: "border" });
  add(b, icon(open ? "Close" : "Menu", 18, "fg", "Icon"));
  return b;
}

/** The phone's open menu: a panel that hangs from the bottom of the header. */
async function mobilePanel(current) {
  const panel = frame("Menu panel", { dir: "col", gap: 8, pad: [8, 24, 24, 24], fill: "bg", w: PAGE_W.mobile });
  sideStroke(panel, "border", ["bottom"]);
  await shadow(panel, "Shadow/Header");
  const nav = frame("Navigation", { dir: "col", gap: 4, w: "fill" });
  add(panel, nav);
  const entry = (label, isCurrent) => {
    const b = pageLink(label, "md", isCurrent);
    add(nav, b);
    size(b, "fill");
    b.primaryAxisAlignItems = "MIN";
    return b;
  };
  entry(page("home"), current === "home");
  const group = frame("Product", { dir: "col", gap: 4, w: "fill" });
  const heading = frame("Group label", { dir: "row", pad: [12, 16, 4, 16] });
  add(heading, await text(tl("common", "header.product"), "App/Overline", "muted", { name: "Group label" }));
  add(group, heading);
  add(nav, group);
  size(group, "fill");
  for (const id of IN_PRODUCT) {
    const b = pageLink(page(id), "md", current === id);
    add(group, b);
    size(b, "fill");
    b.primaryAxisAlignItems = "MIN";
  }
  entry(page("pricing"), false);
  entry(page("about"), false);
  const tools = frame("Language and theme", { dir: "row", gap: 12, pad: [12, 4, 0, 4], align: "center", justify: "between", w: "fill" });
  sideStroke(tools, "border", ["top"]);
  add(tools, languageSwitch(), themePill());
  add(panel, tools);
  return panel;
}

async function buildSiteHeader() {
  const list = [];
  for (const current of CURRENT) {
    list.push({ breakpoint: "desktop", menu: "closed", current });
    list.push({ breakpoint: "mobile", menu: "closed", current });
    list.push({ breakpoint: "mobile", menu: "open", current });
  }
  await variantSet(
    "SiteHeader",
    listOf(list, async (c, { breakpoint: bp, menu, current }) => {
      const desktop = bp === "desktop";
      setup(c, { dir: "row", pad: [8, MARGIN[bp]], align: "center", justify: "between", fill: "bg", minH: desktop ? 100 : 80, w: PAGE_W[bp], clip: false });
      await shadow(c, "Shadow/Header");
      if (desktop) {
        const left = frame("Brand", { dir: "row", align: "center" });
        add(c, left);
        size(left, "fill");
        add(left, instance("Brand", { tone: "default" }));
        const nav = frame("Navigation", { dir: "row", gap: 4, align: "center" });
        add(c, nav);
        add(nav, pageLink(page("home"), "sm", current === "home"));
        add(nav, pageLink(tl("common", "header.product"), "sm", IN_PRODUCT.includes(current), { chevron: true }));
        add(nav, pageLink(page("pricing"), "sm", false));
        add(nav, pageLink(page("about"), "sm", false));
        const right = frame("Language, theme, GitHub", { dir: "row", gap: 12, align: "center", justify: "end" });
        add(c, right);
        size(right, "fill");
        add(right, languageSwitch(), themePill(), github("md"));
      } else {
        add(c, instance("Brand", { tone: "default" }));
        const right = frame("GitHub and menu", { dir: "row", gap: 8, align: "center" });
        add(c, right);
        add(right, github("sm"), menuButton(menu === "open"));
        if (menu === "open") {
          const panel = await mobilePanel(current);
          add(c, panel);
          panel.layoutPositioning = "ABSOLUTE";
          panel.x = 0;
          panel.y = 80;
        }
      }
    }),
    {
      columns: 5,
      path: `${PATH}/site-header.tsx`,
      description:
        "The header of every page (bg, shadow-header). Wide (breakpoint=desktop, min height 100): brand left, the page links in the middle, language, theme and GitHub on the right. Phone (min height 80): brand, GitHub and the 40x40 menu button; menu=open shows the panel that hangs from the header (nav-links in a column, the language and the theme under a rule). current marks the page you are on (underlined in the foreground colour; \"Product\" for the three pages in its menu). The Product dropdown list (nav-menu) opens over the page and is not drawn.",
    },
  );
}

// ---------------------------------------------------------------------------------------------
// SiteCta: the call to action, half on the page and half on the dark footer.

async function buildSiteCta() {
  await variantSet(
    "SiteCta",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      setup(c, { dir: "col", pad: 0, w: PAGE_W[bp] });
      layoutSpace(c, "paddingTop", "section-tight", bp);
      const wrap = frame("Band", { dir: "col", w: "fill" });
      add(c, wrap);
      const container = frame("Container", { dir: "row", pad: [0, MARGIN[bp]], w: "fill" });
      add(wrap, container);
      const band = instance("CtaBand", { breakpoint: bp });
      add(container, band);
      size(band, "fill");
      // The bottom half of the box has the footer's colour: it scales with the box.
      const dark = frame("Footer colour", { dir: "col", fill: "band" });
      wrap.insertChild(0, dark);
      dark.layoutPositioning = "ABSOLUTE";
      const h = Math.max(2, wrap.height);
      dark.resize(PAGE_W[bp], h / 2);
      dark.x = 0;
      dark.y = h / 2;
      dark.constraints = { horizontal: "STRETCH", vertical: "SCALE" };
      if (bp === "desktop") add(c, frame("Spacer", { dir: "col", w: "fill", h: 96, fill: "band" })); // lg:h-24
    }),
    {
      path: `${PATH}/site-cta.tsx`,
      description:
        "The call to action at the end of every page (not on a 404): the CtaBand, the same words everywhere. It sits half on the page and half on the dark footer, so the bottom half of its box is the footer's colour; on a wide screen a 96px dark spacer adds to the footer's own top padding.",
    },
  );
}

// ---------------------------------------------------------------------------------------------
// SiteFooter

function link(label) {
  return instance("TextLink", { variant: "band", state: "default", Label: label });
}

async function linkGroup(heading, labels) {
  const g = frame(heading, { dir: "col" });
  add(g, await text(heading, "App/Title", "band-fg", { name: "Heading" }));
  const list = frame("Links", { dir: "col", gap: 4, pad: [16, 0, 0, 0], w: "fill" });
  add(g, list);
  for (const l of labels) add(list, link(l));
  return g;
}

async function buildSiteFooter() {
  const f = tlRaw("common", "footer");
  const copyright = tl("common", "footer.copyright", { year: "2026", author: AUTHOR, licence: tl("common", "footer.licence") });
  const set = await variantSet(
    "SiteFooter",
    listOf(BP.map((breakpoint) => ({ breakpoint })), async (c, { breakpoint: bp }) => {
      const desktop = bp === "desktop";
      setup(c, { dir: "col", w: PAGE_W[bp] });
      const cta = instance("SiteCta", { breakpoint: bp });
      cta.name = "Show cta";
      add(c, cta);
      size(cta, "fill");
      const footer = frame("Footer", { dir: "col", fill: "band", w: "fill" });
      add(c, footer);

      const body = frame("Container", { dir: desktop ? "row" : "col", gap: desktop ? 64 : 48, pad: [64, MARGIN[bp], 48, MARGIN[bp]], w: "fill" });
      add(footer, body);
      const left = frame("Brand and tagline", { dir: "col", gap: 20, align: "start", w: desktop ? 352 : "fill" });
      add(body, left);
      add(left, instance("Brand", { tone: "on-band" }));
      const tagline = await text(f.tagline, "App/Body", "band-muted", { name: "Tagline", w: "fill" });
      add(left, tagline);
      tagline.maxWidth = 320; // max-w-xs
      const follow = instance("LinkButton", { variant: "primary", icon: "left", Label: f.follow });
      add(left, follow);
      if (desktop) {
        const divider = frame("Divider", { dir: "row", fill: "band-muted", fillOpacity: 0.4 });
        add(body, divider);
        size(divider, 1, "fill");
      }
      const product = await linkGroup(f.productHeading, ["home", "features", "how-it-works", "pricing", "faq"].map(page));
      const project = await linkGroup(f.projectHeading, [page("about"), f.github, f.issues, f.linkedin]);
      const legal = await linkGroup(f.legalHeading, [page("privacy"), page("accessibility"), f.licence]);
      if (desktop) {
        const groups = frame("Link groups", { dir: "row", gap: 32, w: "fill" });
        add(body, groups);
        for (const g of [product, project, legal]) {
          add(groups, g);
          size(g, "fill");
        }
      } else {
        const groups = frame("Link groups", { dir: "col", gap: 40, w: "fill" });
        add(body, groups);
        const row1 = frame("Row 1", { dir: "row", gap: 32, w: "fill" });
        const row2 = frame("Row 2", { dir: "row", gap: 32, w: "fill" });
        add(groups, row1, row2);
        add(row1, product, project);
        size(product, "fill");
        size(project, "fill");
        add(row2, legal);
        size(legal, "fill");
        const empty = frame("Empty cell", { dir: "col" });
        add(row2, empty);
        size(empty, "fill");
      }

      const bottom = frame("Container", { dir: "row", pad: [0, MARGIN[bp]], w: "fill" });
      add(footer, bottom);
      const bar = frame("Copyright", { dir: desktop ? "row" : "col", gap: desktop ? undefined : 4, justify: desktop ? "between" : undefined, pad: [24, 0], w: "fill" });
      sideStroke(bar, "band-muted", ["top"], 0.4);
      add(bottom, bar);
      add(bar, await text(copyright, "App/Body", "band-muted", { name: "Copyright", w: desktop ? undefined : "fill" }));
      add(bar, await text(f.note, "App/Body", "band-muted", { name: "Note", w: desktop ? undefined : "fill" }));
    }),
    {
      path: `${PATH}/site-footer.tsx`,
      description:
        "The end of every page: the call to action (turn off \"Show cta\" on a 404), then the dark footer with the brand, the tagline, the follow button and three link columns (Product, Project, Legal), and the copyright line over a rule. Wide: brand column 352 wide, a vertical rule, three columns; phone: everything in one column, the links in two columns.",
    },
  );
  boolProp(set, "Show cta", true);
}

export async function buildLayout() {
  await buildSiteHeader();
  await buildSiteCta();
  await buildSiteFooter();
}
