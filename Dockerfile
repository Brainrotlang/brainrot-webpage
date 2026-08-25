# Dockerfile
#
# Multi-stage build: compile the CRA app (including fetching the pinned
# brainrot.wasm release via package.json's "prebuild" hook, so this stage
# needs network access) in a Node stage, then serve the static output with
# nginx. Node 24 matches CI (.github/workflows/build.yml), so a build that
# passes CI also builds cleanly here.
#
# The package manager is Yarn 4 via Corepack, exactly as in CI — the Yarn
# 1.22 that ships inside the node image cannot read this repo's lockfile
# format. `.yarnrc.yml` is copied alongside the manifest because it carries
# settings that must be in place *before* install runs (`nodeLinker`), not
# after the later `COPY . .`.

FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --immutable

COPY . .
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
