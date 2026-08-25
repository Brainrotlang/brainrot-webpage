#!/usr/bin/env bash
#
# scripts/configure-cloudfront-spa.sh
#
# Points CloudFront's 403 and 404 responses at /index.html so client-side
# routes survive a refresh.
#
# Why this is needed at all: /tour/basics/variables is a route, not an object
# in the bucket. Clicking through to it never leaves the SPA, so it always
# works — but a refresh or a shared link asks CloudFront for that key
# directly, and S3 has nothing to give it. With an S3 REST origin the answer
# is 403 (AccessDenied) when the origin identity lacks s3:ListBucket and 404
# (NoSuchKey) when it has it, which is why both are mapped here rather than
# guessing which one this distribution produces.
#
# The app then reads the URL and renders the right lesson — or its own 404
# page, which is the tradeoff: with this in place CloudFront can no longer
# tell a mistyped route from a missing asset, so a genuinely absent
# /static/js/typo.js also comes back as index.html with a 200. That is the
# standard SPA arrangement. If it ever matters, replace this with a
# CloudFront Function that rewrites only extensionless paths.
#
# ErrorCachingMinTTL is deliberately 10s, not the 300s default: a real
# origin problem should not be served from cache for five minutes.
#
# Idempotent — running it twice is a no-op. Preserves any other custom error
# responses already configured.
#
# Usage:
#   DISTRIBUTION_ID=E123456789ABC ./scripts/configure-cloudfront-spa.sh
#   DISTRIBUTION_ID=E123456789ABC AWS_PROFILE=personal ./scripts/configure-cloudfront-spa.sh
#   DISTRIBUTION_ID=E123456789ABC DRY_RUN=1 ./scripts/configure-cloudfront-spa.sh

set -euo pipefail

: "${DISTRIBUTION_ID:?Set DISTRIBUTION_ID to the CloudFront distribution id}"
DRY_RUN="${DRY_RUN:-}"

for tool in aws jq; do
  command -v "$tool" >/dev/null || { echo "$tool is required but not installed." >&2; exit 1; }
done

# AWS_PROFILE is optional: unset, the CLI resolves credentials however it
# normally would (env vars, default profile, an instance role). Set, it is
# passed explicitly as --profile *and* any exported access keys are cleared
# for this process — leftover AWS_ACCESS_KEY_ID/AWS_SESSION_TOKEN in a shell
# otherwise shadow the profile you asked for, which surfaces as a baffling
# InvalidClientTokenId from a profile whose credentials are perfectly fine.
aws_args=()
if [ -n "${AWS_PROFILE:-}" ]; then
  aws_args=(--profile "$AWS_PROFILE")
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
  echo "Using AWS profile: $AWS_PROFILE"
fi

# ${a[@]+"${a[@]}"} rather than "${a[@]}": expanding an empty array under
# `set -u` is an error in bash before 4.4, and macOS still ships 3.2.
awscli() {
  aws ${aws_args[@]+"${aws_args[@]}"} "$@"
}

# Fail on credentials here rather than three lines later on a CloudFront
# call, where the error reads as though the distribution were the problem.
echo "Checking credentials ..."
if ! caller="$(awscli sts get-caller-identity --query 'Arn' --output text 2>&1)"; then
  echo "Could not authenticate to AWS:" >&2
  echo "  $caller" >&2
  echo >&2
  echo "Try: aws configure list-profiles, then AWS_PROFILE=<name> $0" >&2
  exit 1
fi
echo "Authenticated as $caller"

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

echo "Reading distribution $DISTRIBUTION_ID ..."
awscli cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > "$workdir/current.json"

etag="$(jq -r '.ETag' "$workdir/current.json")"
jq '.DistributionConfig' "$workdir/current.json" > "$workdir/config.json"

# Keep every error response we are not about to define, then add ours.
jq '
  def spa_responses:
    [
      { ErrorCode: 403, ResponsePagePath: "/index.html", ResponseCode: "200", ErrorCachingMinTTL: 10 },
      { ErrorCode: 404, ResponsePagePath: "/index.html", ResponseCode: "200", ErrorCachingMinTTL: 10 }
    ];
  ((.CustomErrorResponses.Items // []) | map(select(.ErrorCode != 403 and .ErrorCode != 404))) as $kept
  | .CustomErrorResponses = { Quantity: (($kept | length) + 2), Items: ($kept + spa_responses) }
' "$workdir/config.json" > "$workdir/updated.json"

if jq -e --slurpfile before "$workdir/config.json" '
      (.CustomErrorResponses == $before[0].CustomErrorResponses)
    ' "$workdir/updated.json" >/dev/null; then
  echo "Already configured — 403 and 404 both map to /index.html. Nothing to do."
  exit 0
fi

echo "Current error responses:"
jq -c '.CustomErrorResponses' "$workdir/config.json"
echo "New error responses:"
jq -c '.CustomErrorResponses' "$workdir/updated.json"

if [ -n "$DRY_RUN" ]; then
  echo "DRY_RUN set — not applying."
  exit 0
fi

echo "Applying ..."
awscli cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --distribution-config "file://$workdir/updated.json" \
  --if-match "$etag" \
  --query 'Distribution.Status' \
  --output text

cat <<'DONE'

Applied. The distribution takes a few minutes to redeploy.

Verify with a deep link the app owns, requested directly rather than clicked:

  curl -sI https://brainrotlang.com/tour/basics/variables | head -n 1
  # want: HTTP/2 200

  curl -s https://brainrotlang.com/tour/basics/variables | grep -c '<div id="root">'
  # want: 1

Then open that URL in a browser and press reload. A 403 or 404 means the
change has not finished deploying yet.
DONE
