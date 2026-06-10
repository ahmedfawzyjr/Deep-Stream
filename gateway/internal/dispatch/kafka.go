package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
	"go.uber.org/zap"
)

type VideoFramePayload struct {
	PipelineID string    `json:"pipeline_id"`
	Sequence   uint64    `json:"sequence"`
	Data       []byte    `json:"data"`
	Width      int32     `json:"width"`
	Height     int32     `json:"height"`
	Timestamp  time.Time `json:"timestamp"`
}

type AudioChunkPayload struct {
	PipelineID string    `json:"pipeline_id"`
	Sequence   uint64    `json:"sequence"`
	Data       []byte    `json:"data"`
	SampleRate int32     `json:"sample_rate"`
	Timestamp  time.Time `json:"timestamp"`
}

type KafkaDispatcher struct {
	videoWriter *kafka.Writer
	audioWriter *kafka.Writer
	logger      *zap.Logger
}

func NewKafkaDispatcher(brokers []string, videoTopic, audioTopic string, logger *zap.Logger) *KafkaDispatcher {
	videoWriter := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    videoTopic,
		Balancer: &kafka.LeastBytes{},
		Async:    false, // Wait for confirmation for anti-gravity guarantees
	}

	audioWriter := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    audioTopic,
		Balancer: &kafka.LeastBytes{},
		Async:    false,
	}

	return &KafkaDispatcher{
		videoWriter: videoWriter,
		audioWriter: audioWriter,
		logger:      logger,
	}
}

func (kd *KafkaDispatcher) DispatchVideo(ctx context.Context, pipelineID string, seq uint64, data []byte, width, height int32) error {
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
		kd.logger.Error("Failed to marshal video payload", zap.Error(err))
		return err
	}

	err = kd.videoWriter.WriteMessages(ctx, kafka.Message{
		Key:   []byte(pipelineID),
		Value: value,
	})
	if err != nil {
		kd.logger.Error("Failed to write video message to Kafka", zap.Error(err), zap.String("pipeline_id", pipelineID))
		return err
	}

	kd.logger.Info("Successfully dispatched video frame to Kafka", zap.String("pipeline_id", pipelineID), zap.Uint64("sequence", seq))
	return nil
}

func (kd *KafkaDispatcher) DispatchAudio(ctx context.Context, pipelineID string, seq uint64, data []byte, sampleRate int32) error {
	payload := AudioChunkPayload{
		PipelineID: pipelineID,
		Sequence:   seq,
		Data:       data,
		SampleRate: sampleRate,
		Timestamp:  time.Now(),
	}

	value, err := json.Marshal(payload)
	if err != nil {
		kd.logger.Error("Failed to marshal audio payload", zap.Error(err))
		return err
	}

	err = kd.audioWriter.WriteMessages(ctx, kafka.Message{
		Key:   []byte(pipelineID),
		Value: value,
	})
	if err != nil {
		kd.logger.Error("Failed to write audio message to Kafka", zap.Error(err), zap.String("pipeline_id", pipelineID))
		return err
	}

	kd.logger.Info("Successfully dispatched audio chunk to Kafka", zap.String("pipeline_id", pipelineID), zap.Uint64("sequence", seq))
	return nil
}

func (kd *KafkaDispatcher) Close() error {
	if err := kd.videoWriter.Close(); err != nil {
		return fmt.Errorf("failed to close video writer: %w", err)
	}
	if err := kd.audioWriter.Close(); err != nil {
		return fmt.Errorf("failed to close audio writer: %w", err)
	}
	return nil
}
