.PHONY: build test run lint docker-build docker-run clean

build:
	npm run build

test:
	npm test

run:
	npm start

lint:
	npm run lint

docker-build:
	docker build -t ai-crypto-onramp/api-gateway .

docker-run:
	docker run --rm -p 8080:8080 ai-crypto-onramp/api-gateway

clean:
	rm -rf dist node_modules
