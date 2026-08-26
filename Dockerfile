# ─────────────────────────────────────────────────────────────────────────────
# Clasificados Colombia — production image
#
# Multi-stage. The runtime layer carries the standalone server, its static
# assets and nothing else: no pnpm store, no source, no dev dependencies.
#
# Base image is Debian slim rather than Alpine, deliberately. `sharp` is the
# one dependency here with native binaries, and its musl builds are the usual
# source of "works locally, fails in the container" — a bigger image is a
# cheaper problem than an image that cannot resize a photograph.
#
# Builds on any Docker daemon, with or without BuildKit. An earlier version
# used a `--mount=type=cache` for the pnpm store, which is faster on repeat
# builds and would work fine on Coolify — but it made the image impossible to
# build on this machine (Colima's legacy builder, and BuildKit without buildx),
# which meant it could not be verified before being handed over. A Dockerfile
# that has actually been built is worth more than one that is theoretically
# faster.
# ─────────────────────────────────────────────────────────────────────────────
ARG NODE_VERSION=22-bookworm-slim

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

RUN corepack enable

# Only the manifests, so this layer is reused whenever dependencies have not
# changed — which on this project is most builds.
COPY package.json pnpm-lock.yaml ./

# `node-linker=hoisted` produces a flat `node_modules` instead of pnpm's
# symlinked store, and it is required here rather than preferred.
#
# Next's standalone output works by tracing which files the server actually
# needs and copying only those. That tracing does not follow pnpm's symlinks
# reliably: the image built cleanly and then crashed on boot with
# `MODULE_NOT_FOUND: @swc/helpers`, a transitive dependency that was present in
# the store but invisible to the tracer. A flat tree is what the tracer expects.
#
# Set on the install command rather than in a repository `.npmrc`, so local
# development keeps pnpm's normal linking and its disk savings.
#
# `--frozen-lockfile`: the build fails rather than silently resolving a
# different dependency tree than the one that was tested.
ENV NPM_CONFIG_NODE_LINKER=hoisted
RUN pnpm install --frozen-lockfile

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Same linker as the deps stage: the tracer runs here, against that tree.
ENV NPM_CONFIG_NODE_LINKER=hoisted

# Standalone output, which `next start` does not support — see next.config.mjs.
ENV BUILD_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# The environment schema is validated at build time — Payload parses it while
# generating the import map — so these have to exist for the build to run at
# all. `DATABASE_URL` and `PAYLOAD_SECRET` are genuinely placeholders here:
# nothing connects during the build, and the real values arrive as runtime
# environment.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG PAYLOAD_SECRET=build-time-placeholder-value-not-used-at-runtime
ENV DATABASE_URL=${DATABASE_URL}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}

# NEXT_PUBLIC_SERVER_URL is different, and the difference matters.
#
# Anything prefixed NEXT_PUBLIC_ is INLINED INTO THE CLIENT BUNDLE at build
# time. Setting it at runtime does nothing for code that runs in the browser.
# Today nothing client-side reads it — it is only validated — so a placeholder
# builds a working image. That stops being true the moment F16 uses it for
# canonical URLs in a Client Component.
#
# So: pass the real domain as a build argument for any image that will be
# deployed. The default below exists so the image can be built and verified
# without one.
ARG NEXT_PUBLIC_SERVER_URL=https://clasificadoscolombia.co
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# Same rule, same reason: the tip form reads this in a Client Component, so the
# value present at build time is the one that ships. The default is Cloudflare's
# published test key, which always passes — fine for building and verifying an
# image, never for one that gets deployed.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

RUN pnpm build

# ── migrator ─────────────────────────────────────────────────────────────────
# A separate image for schema work.
#
# The runtime image is Next's standalone output: a traced subset containing
# exactly what `server.js` touches. Payload's CLI is not part of that, so
# `node node_modules/payload/bin.js migrate` inside the running container fails
# with MODULE_NOT_FOUND — which is how this stage came to exist.
#
# Built from `deps`, NOT from `builder`. Migrations need the dependencies, the
# Payload config and the migration files; they do not need a compiled Next
# application. An earlier version inherited from `builder` and therefore ran
# `pnpm build` again just to obtain a CLI — which took minutes and was killed
# by the OOM reaper when the stack was already running.
#
# Kept as a one-shot container rather than an entrypoint step: a container that
# migrates when it boots migrates again on every restart and every replica.
FROM node:${NODE_VERSION} AS migrator

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

CMD ["node", "node_modules/payload/bin.js", "migrate"]

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Ensure media directory and documents subfolder exist
RUN mkdir -p /app/media/documents

# `standalone` carries the server and the traced dependencies. `static` and
# `public` are not included in it — Next expects them to be copied alongside,
# and without them the site renders with no CSS and no images.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Migrations run as an explicit deploy step, never automatically on boot — a
# container that migrates when it starts will migrate again on every replica
# and every restart.
COPY --from=builder /app/src/payload/migrations ./src/payload/migrations

EXPOSE 3000

# Liveness only: the probe must not depend on Postgres, or a database blip
# makes the orchestrator kill a process that is perfectly healthy. Readiness
# lives at /api/health/ready and is for the proxy, not the supervisor.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
