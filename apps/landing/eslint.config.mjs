import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import base from "@hybrid-rag/eslint-config/base";
import next from "@hybrid-rag/eslint-config/next";

// The shared rule that rejects raw headings (and effects with an implicit return) must stay: a flat
// config replaces a rule's options, so the entries are taken from the shared base and extended.
const [, ...sharedSyntaxRules] = base.find((config) => config.rules?.["no-restricted-syntax"])?.rules["no-restricted-syntax"] ?? [];

// Props that carry text a person or assistive technology reads. The first list is HTML attributes
// (on any element); the second is the props of our own components (capitalised elements).
const HTML_TEXT_ATTRIBUTES = "aria-label|aria-description|aria-roledescription|aria-valuetext|alt|title|placeholder";
const COMPONENT_TEXT_PROPS =
  "label|lead|eyebrow|caption|heading|description|text|name|title|content|summary|switchTo\\w+|\\w+Label|\\w+Text|\\w+Heading";
const NOT_TEXT_MESSAGE = 'Texts read by people or assistive technology come from the translations: t("namespace.key").';

/** The forms a literal can take as the value of an attribute or prop: "x", {"x"}, {`x`}, {a ? "x" : "y"}, {a || "x"}. */
function literalSelectors(element) {
  const attribute = `${element} > JSXAttribute`;
  return [
    `${attribute} > Literal`,
    `${attribute} > JSXExpressionContainer > Literal`,
    `${attribute} > JSXExpressionContainer > TemplateLiteral`,
    `${attribute} > JSXExpressionContainer > ConditionalExpression > :matches(Literal, TemplateLiteral)`,
    `${attribute} > JSXExpressionContainer > LogicalExpression > :matches(Literal, TemplateLiteral)`,
  ];
}

const textAttributeRules = [
  ...literalSelectors(`JSXOpeningElement`).map((selector) =>
    selector.replace("JSXOpeningElement > JSXAttribute", `JSXAttribute[name.name=/^(${HTML_TEXT_ATTRIBUTES})$/]`),
  ),
  ...literalSelectors(`JSXOpeningElement[name.name=/^[A-Z]/]`).map((selector) =>
    selector.replace("JSXAttribute", `JSXAttribute[name.name=/^(${COMPONENT_TEXT_PROPS})$/]`),
  ),
  // Template literals used as text between tags: {`text`}.
  "JSXElement > JSXExpressionContainer > TemplateLiteral[expressions.length=0]",
].map((selector) => ({ selector, message: NOT_TEXT_MESSAGE }));

// The shared Next config, made stricter: the strict TypeScript rules and every jsx-a11y rule as
// an error (the shared config only has the recommended set).
export default defineConfig([
  ...next,
  ...tseslint.configs.strict,
  // The plugin itself is registered by the Next config; only the strict rule set is added.
  { rules: jsxA11y.flatConfigs.strict.rules },
  {
    rules: {
      eqeqeq: "error",
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Every text goes through the translations (src/messages), never a literal in the markup.
    files: ["src/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        // The product name is the one word that is the same in every language.
        { noStrings: true, allowedStrings: ["hybrid-rag"], ignoreProps: true },
      ],
      "no-restricted-syntax": [
        "error",
        ...sharedSyntaxRules,
        ...textAttributeRules,
      ],
    },
  },
  {
    // A box that scrolls sideways (a wide table in a named <section>, a code block in a <figure>) must
    // be reachable with the keyboard, so it is focusable: the only non-interactive elements the
    // rule lets take a tabindex.
    files: ["src/**/*.tsx"],
    rules: { "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["section", "figure"], roles: [] }] },
  },
  // Command-line scripts print their results.
  { files: ["scripts/**"], rules: { "no-console": "off" } },
  globalIgnores([".lighthouseci/**", "playwright-report/**", "test-results/**"]),
]);
