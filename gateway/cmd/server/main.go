package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"deepstream/gateway/internal/config"
	"deepstream/gateway/internal/dispatch"
	"deepstream/gateway/internal/ingest"
	"deepstream/gateway/internal/server"
	"deepstream/gateway/internal/server/middleware"
	"go.uber.org/zap"
)

func main() {
	// 1. Initialize Logger
	logger, err := zap.NewProduction()
	if err != nil {
		panic("Failed to initialize zap logger: " + err.Error())
	}
	defer logger.Sync()

	logger.Info("Starting DeepStream Ingestion Gateway...")

	// 2. Load Config
	cfg := config.Load()

	// 3. Initialize Components
	validator := ingest.NewValidator(cfg.JWTSecret)
	
	kafkaDisp := dispatch.NewKafkaDispatcher(
		cfg.KafkaBrokers,
		cfg.KafkaVideoTopic,
		cfg.KafkaAudioTopic,
		logger,
	)
	defer kafkaDisp.Close()

	redisDisp := dispatch.NewRedisDispatcher(
		cfg.RedisAddr,
		logger,
	)
	defer redisDisp.Close()

	rateLimiter := middleware.NewRateLimiter(
		float64(cfg.RateLimitMaxRequests),
		float64(cfg.RateLimitFillInterval),
	)

	// 4. Initialize HTTP Server
	httpServer := server.NewHTTPServer(":"+cfg.HTTPPort, logger)
	go func() {
		if err := httpServer.Start(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("HTTP health server failed to start", zap.Error(err))
		}
	}()

	// 5. Initialize Ingestion Server
	ingestServer := server.NewIngestionServer(
		validator,
		kafkaDisp,
		redisDisp,
		rateLimiter,
		logger,
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stream := make(chan *server.VideoStreamRequest, 100)
	out := make(chan *server.VideoStreamResponse, 100)

	// Simulation goroutine generating dummy video frames (PNG magic bytes)
	go func() {
		for i := uint64(1); i <= 10; i++ {
			select {
			case <-ctx.Done():
				return
			default:
				stream <- &server.VideoStreamRequest{
					PipelineID: "pipeline-001",
					Frame: &server.VideoFrame{
						Sequence: i,
						Data:     []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}, // Valid PNG header
						Width:    640,
						Height:   480,
					},
				}
				time.Sleep(100 * time.Millisecond)
			}
		}
		close(stream)
	}()

	// Read outputs in background
	go func() {
		for resp := range out {
			logger.Info("Received frame ack response", 
				zap.Uint64("seq", resp.Sequence), 
				zap.Bool("success", resp.Success),
				zap.String("error", resp.ErrorMessage),
			)
		}
	}()

	// Handle graceful shutdown signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		logger.Info("Received shutdown signal, starting clean shutdown", zap.String("signal", sig.String()))
		cancel()
		
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			logger.Error("HTTP server shutdown error", zap.Error(err))
		}
	}()

	// Block on stream execution loop
	err = ingestServer.StreamVideo(ctx, stream, out)
	if err != nil && err != context.Canceled {
		logger.Fatal("Stream processing loop ended with error", zap.Error(err))
	}

	logger.Info("Ingestion Gateway stopped gracefully.")
}
