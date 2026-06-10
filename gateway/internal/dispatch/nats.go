package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"go.uber.org/zap"
)

type ControlSignalPayload struct {
	PipelineID string    `json:"pipeline_id"`
	Action     string    `json:"action"` // e.g. "START", "STOP", "PAUSE"
	Timestamp  time.Time `json:"timestamp"`
}

type NatsDispatcher struct {
	conn   *nats.Conn
	js     nats.JetStreamContext
	logger *zap.Logger
}

func NewNatsDispatcher(url string, logger *zap.Logger) (*NatsDispatcher, error) {
	conn, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	js, err := conn.JetStream()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to get NATS JetStream context: %w", err)
	}

	// Create stream if it does not exist
	_, err = js.AddStream(&nats.StreamConfig{
		Name:     "DEEPSTREAM_CONTROL",
		Subjects: []string{"deepstream.control.*"},
	})
	if err != nil {
		// Stream might already exist, log and continue
		logger.Warn("Stream addition status or error", zap.Error(err))
	}

	return &NatsDispatcher{
		conn:   conn,
		js:     js,
		logger: logger,
	}, nil
}

func (nd *NatsDispatcher) DispatchControl(ctx context.Context, pipelineID string, action string) error {
	payload := ControlSignalPayload{
		PipelineID: pipelineID,
		Action:     action,
		Timestamp:  time.Now(),
	}

	value, err := json.Marshal(payload)
	if err != nil {
		nd.logger.Error("Failed to marshal control signal payload", zap.Error(err))
		return err
	}

	subject := fmt.Sprintf("deepstream.control.%s", pipelineID)
	_, err = nd.js.Publish(subject, value, nats.Context(ctx))
	if err != nil {
		nd.logger.Error("Failed to publish control message to NATS", zap.Error(err), zap.String("pipeline_id", pipelineID))
		return err
	}

	nd.logger.Info("Successfully dispatched control signal to NATS JetStream", zap.String("pipeline_id", pipelineID), zap.String("action", action))
	return nil
}

func (nd *NatsDispatcher) Close() {
	nd.conn.Close()
}
