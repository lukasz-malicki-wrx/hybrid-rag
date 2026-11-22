# The build context is the repository root: docker build -f apps/web/Dockerfile .
# Prune: cut the monorepo down to the web app and the workspaces it uses. Turbo is installed
# at the version pinned in the root package.json.
FROM node:22.23.5-alpine AS prune
WORKDIR /repo
ENV TURBO_TELEMETRY_DISABLED=1
COPY package.json ./
RUN npm install --global --no-audit --no-fund \
    "turbo@$(node -p "require('./package.json').devDependencies.turbo")"
COPY . .
RUN turbo prune @hybrid-rag/web --docker

# Dependencies from the pruned lockfile. Only the manifests are copied, so this layer stays
# cached until a package.json or the lockfile changes.
FROM node:22.23.5-alpine AS deps
WORKDIR /app
COPY --from=prune /repo/out/json/ ./
RUN npm ci --no-audit --no-fund

# Build. NEXT_PUBLIC_API_URL is the API address as the *browser* sees it; it is baked in here.
FROM node:22.23.5-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/ ./
COPY --from=prune /repo/out/full/ ./
RUN npm run build --workspace @hybrid-rag/web

# Runtime: only the standalone server and static assets, as the unprivileged node user.
# The standalone output keeps the monorepo layout, so the server lives under apps/web.
FROM node:22.23.5-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=1000:1000 /app/apps/web/.next/standalone ./
COPY --from=build --chown=1000:1000 /app/apps/web/.next/static ./apps/web/.next/static
USER 1000:1000
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "apps/web/server.js"]
