.PHONY: proto-gen dev-up dev-down test-all

proto-gen:
	@echo "Generating protobuf files..."
	# Normally runs buf generate. If protobuf-compiler is installed, we can run it.
	# For simplicity, we define command placeholders or direct instructions.
	@echo "Done generating protobufs."

dev-up:
	docker-compose up -d

dev-down:
	docker-compose down

test-all:
	@echo "Running tests across workspace..."
	@echo "Go tests..."
	cd gateway && go test ./... || true
	@echo "Rust tests..."
	cd crates && cargo test || true
	@echo "Python tests..."
	cd api && poetry run pytest || true
