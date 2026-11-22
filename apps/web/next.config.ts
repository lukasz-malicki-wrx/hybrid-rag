import path from "node:path";
import type { NextConfig } from "next";

// Packages are installed in the repository root's node_modules, so both the file tracer and
// Turbopack have to look there instead of at this app's directory.
const repoRoot = path.resolve(import.meta.dirname, "../..");

const nextConfig: NextConfig = {
  // Self-contained server bundle, built only for the Docker image (NEXT_OUTPUT=standalone);
  // local `next start` and the e2e tests use the regular build.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@hybrid-rag/ui"],
  cacheComponents: true,
  partialPrefetching: true,
  // Keep `next dev` from writing extra files into the project tree.
  agentRules: false,
  turbopack: {
    root: repoRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
