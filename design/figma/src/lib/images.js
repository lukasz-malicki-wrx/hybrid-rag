/**
 * The landing screenshots (apps/landing/public/screenshots, converted to PNG by build.mjs) as image
 * fills. shot("chat", "light") is the light screenshot of the chat.
 */
import { DATA } from "../generated/data.js";

const cache = new Map();

export function shotNames() {
  return Object.keys(DATA.screenshots);
}

export function shotSize(name, scheme = "light") {
  const s = DATA.screenshots[`${name}-${scheme}`];
  if (!s) throw new Error(`No screenshot ${name}-${scheme}. Available: ${shotNames().join(", ")}`);
  return { width: s.width, height: s.height };
}

export function shotPaint(name, scheme = "light", scaleMode = "FILL") {
  const key = `${name}-${scheme}`;
  const s = DATA.screenshots[key];
  if (!s) throw new Error(`No screenshot ${key}. Available: ${shotNames().join(", ")}`);
  if (!cache.has(key)) cache.set(key, figma.createImage(figma.base64Decode(s.base64)).hash);
  return { type: "IMAGE", imageHash: cache.get(key), scaleMode };
}

/**
 * A rectangle showing a screenshot at `width` px wide (height from the picture's ratio). The
 * rectangle is named "Screenshot/<name>" so the dark pass can swap it for the dark picture.
 */
export function shot(name, scheme, width) {
  const { width: w, height: h } = shotSize(name, scheme);
  const r = figma.createRectangle();
  r.name = `Screenshot/${name}`;
  r.resize(width, Math.round((width * h) / w));
  r.fills = [shotPaint(name, scheme)];
  return r;
}
