package protocol

import (
	"errors"
	"fmt"
	"sync"

	"go.uber.org/zap"
)

type WebRtcSession struct {
	ID         string
	PipelineID string
	Active     bool
	logger     *zap.Logger
}

type WebRtcIngester struct {
	sessions map[string]*WebRtcSession
	mu       sync.RWMutex
	logger   *zap.Logger
}

func NewWebRtcIngester(logger *zap.Logger) *WebRtcIngester {
	return &WebRtcIngester{
		sessions: make(map[string]*WebRtcSession),
		logger:   logger,
	}
}

// OfferSDP handles incoming session offers and returns a mock Answer SDP.
func (w *WebRtcIngester) OfferSDP(pipelineID string, sdpOffer string) (string, error) {
	if sdpOffer == "" {
		return "", errors.New("empty SDP offer")
	}

	w.mu.Lock()
	sessionID := fmt.Sprintf("webrtc-%d", len(w.sessions)+1)
	w.sessions[sessionID] = &WebRtcSession{
		ID:         sessionID,
		PipelineID: pipelineID,
		Active:     true,
		logger:     w.logger,
	}
	w.mu.Unlock()

	w.logger.Info("WebRTC offer received and processed", zap.String("session_id", sessionID), zap.String("pipeline_id", pipelineID))

	// Mock SDP answer string
	sdpAnswer := fmt.Sprintf("v=0\no=- %s 2 IN IP4 127.0.0.1\ns=DeepStream Session\nt=0 0\na=group:BUNDLE video\nm=video 9 UDP/TLS/RTP/SAVPF 96\nc=IN IP4 127.0.0.1\na=rtpmap:96 H264/90000", sessionID)
	return sdpAnswer, nil
}

func (w *WebRtcIngester) CloseSession(sessionID string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	session, exists := w.sessions[sessionID]
	if !exists {
		return errors.New("session not found")
	}

	session.Active = false
	delete(w.sessions, sessionID)
	w.logger.Info("WebRTC session terminated", zap.String("session_id", sessionID))
	return nil
}
