package server

import (
	"context"
	"errors"
	"fmt"
	"time"

	"deepstream/gateway/internal/circuit"
	"deepstream/gateway/internal/dispatch"
	"deepstream/gateway/internal/ingest"
	"deepstream/gateway/internal/server/middleware"
	"go.uber.org/zap"
)

type VideoFrame struct {
	Sequence uint64
	Data     []byte
	Width    int32
	Height   int32
}

type VideoStreamRequest struct {
	PipelineID string
	Token      string
	Frame      *VideoFrame
}

type VideoStreamResponse struct {
	Sequence     uint64
	Success      bool
	ErrorMessage string
}

type IngestionServer struct {
	breaker         *circuit.AntiGravityBreaker
	validator       *ingest.Validator
	kafkaDispatcher *dispatch.KafkaDispatcher
	redisDispatcher *dispatch.RedisDispatcher
	rateLimiter     *middleware.RateLimiter
	logger          *zap.Logger
}

func NewIngestionServer(
	validator *ingest.Validator,
	kafkaDisp *dispatch.KafkaDispatcher,
	redisDisp *dispatch.RedisDispatcher,
	rateLimiter *middleware.RateLimiter,
	logger *zap.Logger,
) *IngestionServer {
	return &IngestionServer{
		breaker:         circuit.NewAntiGravityBreaker("video-ingestion"),
		validator:       validator,
		kafkaDispatcher: kafkaDisp,
		redisDispatcher: redisDisp,
		rateLimiter:     rateLimiter,
		logger:          logger,
	}
}

// StreamVideo handles incoming video stream requests with validation, rate limiting, and fallback dispatching.
func (s *IngestionServer) StreamVideo(ctx context.Context, stream chan *VideoStreamRequest, out chan *VideoStreamResponse) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case req, ok := <-stream:
			if !ok {
				return nil
			}

			var err error
			resp := &VideoStreamResponse{
				Sequence: req.Frame.Sequence,
				Success:  true,
			}

			// 1. Authenticate token
			if req.Token != "" {
				claims, authErr := s.Authenticate(ctx, req.Token)
				if authErr != nil {
					resp.Success = false
					resp.ErrorMessage = "unauthenticated: " + authErr.Error()
					out <- resp
					continue
				}

				// 2. Check Rate Limit per User
				if !s.rateLimiter.Allow(claims) {
					resp.Success = false
					resp.ErrorMessage = "rate limit exceeded"
					out <- resp
					continue
				}
			}

			// 3. Validate Frame
			if req.Frame == nil {
				resp.Success = false
				resp.ErrorMessage = "empty frame"
				out <- resp
				continue
			}

			valErr := s.validator.ValidateFrame(req.PipelineID, req.Frame.Data, req.Frame.Width, req.Frame.Height)
			if valErr != nil {
				resp.Success = false
				resp.ErrorMessage = "validation failed: " + valErr.Error()
				out <- resp
				continue
			}

			// 4. Dispatch with Circuit Breaker and Fallback
			_, err = s.breaker.Execute(func() (interface{}, error) {
				// Try Kafka first
				dispatchErr := s.kafkaDispatcher.DispatchVideo(
					ctx,
					req.PipelineID,
					req.Frame.Sequence,
					req.Frame.Data,
					req.Frame.Width,
					req.Frame.Height,
				)
				if dispatchErr != nil {
					s.logger.Warn("Kafka dispatch failed, invoking Anti-Gravity fallback to Redis Stream", 
						zap.Error(dispatchErr), zap.String("pipeline_id", req.PipelineID))
					
					// Fallback to Redis Stream
					fallbackErr := s.redisDispatcher.DispatchVideo(
						ctx,
						req.PipelineID,
						req.Frame.Sequence,
						req.Frame.Data,
						req.Frame.Width,
						req.Frame.Height,
					)
					if fallbackErr != nil {
						s.logger.Error("Redis fallback also failed, dropping frame", zap.Error(fallbackErr))
						return nil, fmt.Errorf("primary Kafka and backup Redis dispatch both failed: %w", fallbackErr)
					}
				}
				return nil, nil
			})

			if err != nil {
				resp.Success = false
				resp.ErrorMessage = err.Error()
			}
			out <- resp
		}
	}
}

// Authenticate checks user identity based on JWT.
func (s *IngestionServer) Authenticate(ctx context.Context, token string) (string, error) {
	claims, err := s.validator.ValidateJWT(token)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}
