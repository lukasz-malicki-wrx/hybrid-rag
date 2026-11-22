import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle, built only for the Docker image (NEXT_OUTPUT=standalone);
  // local `next start` and the e2e tests use the regular build.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  // Keep `next dev` from writing extra files into the project tree.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
