# Makefile
#
# Thin wrapper around the yarn scripts (package.json) and the Docker
# image (Dockerfile) — the yarn scripts stay the source of truth (e.g.
# fetch-wasm runs automatically via "prestart"/"prebuild" hooks), this
# just gives one-word entry points for them plus the Docker-only targets.

IMAGE := brainrot-webpage
PORT := 8080

.PHONY: install fetch-wasm start build test verify-wasm clean \
        docker-build docker-run docker-clean deploy-s3

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

verify-wasm:
	yarn verify:wasm

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
