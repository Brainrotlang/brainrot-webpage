# Dockerfile
#
# Multi-stage build: compile the CRA app (including fetching the pinned
# brainrot.wasm release via package.json's "prebuild" hook) in a Node
# stage, then serve the static output with nginx. Node 18 matches CI
# (.github/workflows/build.yml's "Set Node.js 18.x"), so a build that
# passes CI also builds cleanly here.

FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
