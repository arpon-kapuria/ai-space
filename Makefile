.PHONY: all lint typecheck test build ci

all: ci

ci: lint typecheck test build

lint:
	npm run lint

typecheck:
	npx tsc --noEmit

test:
	npm test

build:
	npm run build