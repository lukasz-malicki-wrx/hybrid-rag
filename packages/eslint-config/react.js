import { defineConfig } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import typescript from "./typescript.js";

const boundaryMessage = "Packages must not depend on an app or on Next.";

/** Source-only React packages: no dependency on an app or on Next. */
export default defineConfig([
  ...typescript,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "next", message: boundaryMessage },
            { name: "@hybrid-rag/web", message: boundaryMessage },
          ],
          patterns: [
            { group: ["@/*"], message: `${boundaryMessage} The "@/" alias points into an app.` },
            { group: ["next/*"], message: boundaryMessage },
            { group: ["@hybrid-rag/web/*"], message: boundaryMessage },
          ],
        },
      ],
    },
  },
]);
