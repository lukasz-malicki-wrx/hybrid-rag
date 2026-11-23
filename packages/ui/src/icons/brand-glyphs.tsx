import { siFastapi, siNextdotjs, siOllama, siPostgresql } from "simple-icons";
import type { IconProps } from "./create-icon";

/**
 * Logos of the technologies the project is made of, from Simple Icons (https://simpleicons.org,
 * CC0). They are filled shapes in one colour (currentColor), not strokes like the other glyphs.
 * Brand marks are the property of their owners; they name the parts, they do not endorse anything.
 */
function brand(path: string) {
  return function BrandGlyph(props: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d={path} />
      </svg>
    );
  };
}

export const Postgres = brand(siPostgresql.path);
export const Ollama = brand(siOllama.path);
export const FastApi = brand(siFastapi.path);
export const NextJs = brand(siNextdotjs.path);
