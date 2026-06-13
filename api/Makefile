.PHONY: run test coverage migrate migrate-test lint build docker-build

run:
	go run ./cmd/server

test:
	go test ./... -race -coverprofile=coverage.out

coverage: test
	go tool cover -html=coverage.out

migrate:
	@echo "Running local migrations... (server cmd main executes them on boot)"
	go run ./cmd/server

migrate-test:
	@echo "Running test migrations... (handled automatically inside repository_test integration tests)"

lint:
	golangci-lint run ./...

build:
	go build -o bin/server ./cmd/server

docker-build:
	docker build -t deepstream-api .
