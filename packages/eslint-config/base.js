/** Rules shared by every workspace package and app. */
export default [
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
      ],
    },
  },
];
