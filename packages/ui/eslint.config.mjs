import { defineConfig } from "eslint/config";
import react from "@hybrid-rag/eslint-config/react";

export default defineConfig([
  ...react,
  {
    // The one file that may import the icon library.
    files: ["src/icons/glyphs.ts"],
    rules: { "@typescript-eslint/no-restricted-imports": "off" },
  },
]);
