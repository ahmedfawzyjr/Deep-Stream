package dispatch

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

type RedisDispatcher struct {
	client *redis.Client
	logger *zap.Logger
}

func NewRedisDispatcher(addr string, logger *zap.Logger) *RedisDispatcher {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	return &RedisDispatcher{
		client: client,
		logger: logger,
	}
}

func (rd *RedisDispatcher) DispatchVideo(ctx context.Context, pipelineID string, seq uint64, data []byte, width, height int32) error {
	payload := VideoFramePayload{
		PipelineID: pipelineID,
		Sequence:   seq,
		Data:       data,
		Width:      width,
		Height:     height,
		Timestamp:  time.Now(),
	}

	value, err := json.Marshal(payload)
	if err != nil {
		rd.logger.Error("Failed to marshal video payload for Redis", zap.Error(err))
		return err
	}

	// XAdd publishes to a Redis stream
	err = rd.client.XAdd(ctx, &redis.XAddArgs{
		Stream: "stream:video:ingest",
		Values: map[string]interface{}{
			"pipeline_id": pipelineID,
			"sequence":    seq,
			"payload":     value,
		},
	}).Err()

	if err != nil {
		rd.logger.Error("Failed to dispatch video to Redis Stream", zap.Error(err), zap.String("pipeline_id", pipelineID))
		return err
	}

	rd.logger.Info("Successfully dispatched video frame to Redis Stream", zap.String("pipeline_id", pipelineID), zap.Uint64("sequence", seq))
	return nil
}

func (rd *RedisDispatcher) DispatchAudio(ctx context.Context, pipelineID string, seq uint64, data []byte, sampleRate int32) error {
	payload := AudioChunkPayload{
		PipelineID: pipelineID,
		Sequence:   seq,
		Data:       data,
		SampleRate: sampleRate,
		Timestamp:  time.Now(),
	}

	value, err := json.Marshal(payload)
	if err != nil {
		rd.logger.Error("Failed to marshal audio payload for Redis", zap.Error(err))
		return err
	}

	err = rd.client.XAdd(ctx, &redis.XAddArgs{
		Stream: "stream:audio:ingest",
		Values: map[string]interface{}{
			"pipeline_id": pipelineID,
			"sequence":    seq,
			"payload":     value,
		},
	}).Err()

	if err != nil {
		rd.logger.Error("Failed to dispatch audio to Redis Stream", zap.Error(err), zap.String("pipeline_id", pipelineID))
		return err
	}

	rd.logger.Info("Successfully dispatched audio chunk to Redis Stream", zap.String("pipeline_id", pipelineID), zap.Uint64("sequence", seq))
	return nil
}

func (rd *RedisDispatcher) Close() error {
	return rd.client.Close()
}
