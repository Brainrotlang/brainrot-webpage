# Makefile
#
# Thin wrapper around the yarn scripts (package.json) and the Docker
# image (Dockerfile) — the yarn scripts stay the source of truth (e.g.
# fetch-wasm runs automatically via "prestart"/"prebuild" hooks), this
# just gives one-word entry points for them plus the Docker-only targets.

IMAGE := brainrot-webpage
PORT := 8080

.PHONY: install fetch-wasm start build test typecheck verify-wasm verify-lessons clean \
        docker-build docker-run docker-clean deploy-s3 cloudfront-spa

install:
	yarn install

fetch-wasm:
	yarn fetch-wasm

start:
	yarn start

build:
	yarn build

test:
	CI=true yarn test --watchAll=false

typecheck:
	yarn typecheck

verify-wasm:
	yarn verify:wasm

verify-lessons:
	yarn verify:lessons

clean:
	rm -rf build public/wasm

docker-build:
	docker build -t $(IMAGE) .

docker-run: docker-build
	docker run --rm -p $(PORT):80 $(IMAGE)

docker-clean:
	docker rmi $(IMAGE) 2>/dev/null || true

# Usage: make deploy-s3 BUCKET=my-bucket [DISTRIBUTION_ID=E123]
deploy-s3:
	BUCKET=$(BUCKET) DISTRIBUTION_ID=$(DISTRIBUTION_ID) ./scripts/deploy-s3.sh

# One-time per distribution: make client-side routes survive a refresh.
# Usage: make cloudfront-spa DISTRIBUTION_ID=E123 [DRY_RUN=1]
cloudfront-spa:
	DISTRIBUTION_ID=$(DISTRIBUTION_ID) DRY_RUN=$(DRY_RUN) ./scripts/configure-cloudfront-spa.sh
