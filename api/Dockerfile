# Build stage
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache protobuf-dev protoc git

WORKDIR /app

# Install protobuf plugins
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.33.0
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .

# Generate proto files into api/internal/pb
RUN mkdir -p internal/pb
RUN protoc --proto_path=../inference/proto --go_out=internal/pb --go_opt=paths=source_relative --go-grpc_out=internal/pb --go-grpc_opt=paths=source_relative inference.proto

# Build with gRPC support enabled
RUN CGO_ENABLED=0 GOOS=linux go build -tags grpc -o server ./cmd/server

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary and migrations
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./server"]
