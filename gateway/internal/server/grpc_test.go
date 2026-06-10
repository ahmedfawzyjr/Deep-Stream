package server

import (
	"context"
	"testing"
	"time"

	"deepstream/gateway/internal/dispatch"
	"deepstream/gateway/internal/ingest"
	"deepstream/gateway/internal/server/middleware"
	"go.uber.org/zap"
)

func setupTestServer() *IngestionServer {
	logger := zap.NewNop()
	validator := ingest.NewValidator("super-secret-key-deepstream-2026")
	
	// Create local mock dispatcher instances pointing to dummy hosts
	kafkaDisp := dispatch.NewKafkaDispatcher([]string{"localhost:9092"}, "test-video", "test-audio", logger)
	redisDisp := dispatch.NewRedisDispatcher("localhost:6379", logger)
	rateLimiter := middleware.NewRateLimiter(10, 10)

	return NewIngestionServer(validator, kafkaDisp, redisDisp, rateLimiter, logger)
}

func TestAuthentication(t *testing.T) {
	srv := setupTestServer()
	ctx := context.Background()

	// An empty token must fail validation
	_, err := srv.Authenticate(ctx, "")
	if err == nil {
		t.Fatal("Expected error on empty token, got nil")
	}

	// Invalid token signature should fail validation
	_, err = srv.Authenticate(ctx, "invalid.token.format")
	if err == nil {
		t.Fatal("Expected signature verification failure, got nil")
	}
}

func TestStreamVideoChannel(t *testing.T) {
	srv := setupTestServer()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stream := make(chan *VideoStreamRequest, 2)
	out := make(chan *VideoStreamResponse, 2)

	// Sending a valid request that fails on dispatch because Kafka/Redis aren't running.
	// But it should run through circuit breaking and report success or failure cleanly.
	stream <- &VideoStreamRequest{
		PipelineID: "test-pipeline",
		Frame: &VideoFrame{
			Sequence: 1,
			Data:     []byte{0x89, 0x50, 0x4E, 0x47}, // Valid PNG magic bytes
			Width:    640,
			Height:   480,
		},
	}
	close(stream)

	err := srv.StreamVideo(ctx, stream, out)
	if err != nil {
		t.Fatalf("StreamVideo failed: %v", err)
	}

	resp := <-out
	// It should sequence match
	if resp.Sequence != 1 {
		t.Errorf("Expected sequence 1, got %d", resp.Sequence)
	}
}
