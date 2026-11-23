/**
 * Dates and outside links of the privacy page and the accessibility statement. ISO dates (year,
 * month, day): the pages show them in the reader's language. Change a date only together with
 * the text it belongs to.
 */
export const LEGAL = {
  /** When the privacy page was last checked against what the site does. */
  privacyUpdated: "2026-11-22",
  /** When the accessibility statement was written and its checks last run. */
  accessibilityUpdated: "2026-11-22",
  /** The host's own description of what it processes. */
  hostPrivacy: "https://vercel.com/legal/privacy-notice",
  /** What Anthropic says about data sent to its API (only when the app is set to use it). */
  anthropicPrivacy: "https://www.anthropic.com/legal/privacy",
} as const;
