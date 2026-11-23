/** Rules shared by every workspace package and app. */
export default [
  {
    // The icon set is an implementation detail of the ui package (src/icons/glyphs.ts).
    // The typescript-eslint variant, because React packages configure the core rule already.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(lucide-react|@tabler/icons|@phosphor-icons|@heroicons|react-icons)(/|$|-)",
              message: 'Import icons from "@hybrid-rag/ui/icons", so that the set can be replaced in one place.',
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      // Use early returns in a small function instead.
      "no-nested-ternary": "error",
      // An effect's return value is its cleanup. `useEffect(() => el.scrollIntoView())` returns
      // a promise in current Chrome, and React crashes when it calls it.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name=/^use(Layout|Insertion)?Effect$/] > ArrowFunctionExpression[body.type!='BlockStatement']",
          message: "Give the effect a block body, so that it does not return a value by accident.",
        },
        {
          selector: "JSXOpeningElement[name.name=/^h[1-6]$/]",
          message: 'Use Heading from "@hybrid-rag/ui/heading", so that every title has the same sizes.',
        },
      ],
    },
  },
];
