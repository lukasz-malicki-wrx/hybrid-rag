import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import base from "./base.js";

/** Plain TypeScript packages: the TypeScript recommended rules plus the shared base. */
export default defineConfig([...tseslint.configs.recommended, ...base]);
