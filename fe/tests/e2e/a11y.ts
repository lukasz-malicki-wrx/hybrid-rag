import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Fails the test on any WCAG 2.1 A/AA violation axe can detect. */
export async function expectAccessible(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const summary = violations.map(
    (v) =>
      `${v.id}: ${v.help}\n` +
      v.nodes.map((n) => `  ${n.target.join(" ")}: ${n.failureSummary?.split("\n").slice(1).join(" ")}`).join("\n"),
  );
  expect(summary, summary.join("\n")).toEqual([]);
}
