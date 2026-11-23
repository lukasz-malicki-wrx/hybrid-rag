export type Params = Record<string, string | number>;

/** Fills {name} placeholders; a placeholder without a value stays as written. */
export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
