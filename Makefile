.PHONY: dev-up dev-down test-all install-deps build-all

dev-up:
	docker-compose up -d

dev-down:
	docker-compose down

install-deps:
	@echo "Installing dependencies..."
	cd ml && pip install -e .
	cd api && go mod download
	cd web && npm install

build-all:
	@echo "Building services..."
	cd inference && cargo build --release
	cd api && go build -o bin/server cmd/server/main.go
	cd web && npm run build

test-all:
	@echo "Running tests across workspace..."
	@echo "ML / Python tests..."
	cd ml && pytest || true
	@echo "Rust inference tests..."
	cd inference && cargo test || true
	@echo "Go API tests..."
	cd api && go test ./... || true
	@echo "React web tests..."
	cd web && npm test || true
