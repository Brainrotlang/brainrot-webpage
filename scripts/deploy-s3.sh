#!/usr/bin/env bash
#
# scripts/deploy-s3.sh
#
# Builds the app and syncs the static output to an S3 bucket. Uploads in
# three passes rather than one plain `aws s3 sync` because two things need
# non-default treatment:
#
#   - brainrot.mjs needs an explicit application/javascript content-type.
#     aws-cli's built-in guessing doesn't reliably map .mjs -> JS, and the
#     playground's `import()` of it fails silently if it's served as
#     anything else (same issue nginx.conf works around for the Docker
#     path).
#   - index.html must not be cached, since it's what points at the
#     (content-hashed) JS/CSS bundle for a given deploy; everything else
#     is safe to cache aggressively (hashed filenames, or a `?v=`
#     cache-buster for the unhashed wasm/mjs assets — see wasmWorker.ts).
#
# Usage: BUCKET=my-bucket ./scripts/deploy-s3.sh
#        BUCKET=my-bucket DISTRIBUTION_ID=E123 ./scripts/deploy-s3.sh

set -euo pipefail
cd "$(dirname "$0")/.."

: "${BUCKET:?Set BUCKET env var to the target S3 bucket name}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-}"

yarn build

aws s3 sync build/ "s3://$BUCKET" \
  --delete \
  --exclude "index.html" \
  --exclude "*.mjs" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 sync build/ "s3://$BUCKET" \
  --delete \
  --exclude "*" \
  --include "*.mjs" \
  --content-type "application/javascript" \
  --cache-control "public,max-age=31536000,immutable"

aws s3 cp build/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache"

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
fi
