/**
 * Texts come only from the i18n catalogs (apps/web/src/i18n/messages, apps/landing/src/messages),
 * never typed into the plugin, so the design says what the product says.
 *
 *   tw("chat.newChat")                 // app catalog, dotted key
 *   tl("home", "hero.title")           // landing catalog: file, dotted key
 *   tw("sidebar.count", { count: 3 })  // placeholders {count}; plurals pick one/other
 */
import { DATA } from "../generated/data.js";

function dig(obj, key, where) {
  const value = key.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
  if (value === undefined) throw new Error(`Missing text ${where}:${key}`);
  return value;
}

function finish(value, vars, where, key) {
  let v = value;
  if (v && typeof v === "object") {
    if ("other" in v) v = vars && vars.count === 1 && "one" in v ? v.one : v.other;
    else throw new Error(`Text ${where}:${key} is an object, not a string`);
  }
  if (typeof v !== "string") throw new Error(`Text ${where}:${key} is not a string`);
  // Rich text tags (<b>, <code>, <link>) are dropped: the words stay.
  v = v.replace(/<\/?[a-zA-Z][^>]*>/g, "");
  if (vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return v;
}

export function tw(key, vars) {
  return finish(dig(DATA.texts.web, key, "web"), vars, "web", key);
}

export function tl(file, key, vars) {
  const catalog = DATA.texts.landing[file];
  if (!catalog) throw new Error(`No landing catalog "${file}" (${Object.keys(DATA.texts.landing).join(", ")})`);
  return finish(dig(catalog, key, file), vars, file, key);
}

/** The raw value (object or array) of a landing key, to iterate lists such as FAQ items. */
export function tlRaw(file, key) {
  return dig(DATA.texts.landing[file], key, file);
}

export function twRaw(key) {
  return dig(DATA.texts.web, key, "web");
}

export const LOCALE = DATA.texts.locale;
