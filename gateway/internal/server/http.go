package server

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"go.uber.org/zap"
)

type HTTPServer struct {
	server *http.Server
	logger *zap.Logger
}

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
}

func NewHTTPServer(addr string, logger *zap.Logger) *HTTPServer {
	mux := http.NewServeMux()
	
	hs := &HTTPServer{
		logger: logger,
	}

	mux.HandleFunc("/healthz", hs.handleHealthz)
	mux.HandleFunc("/livez", hs.handleHealthz)
	mux.HandleFunc("/readyz", hs.handleHealthz)

	hs.server = &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	return hs
}

func (hs *HTTPServer) Start() error {
	hs.logger.Info("Starting HTTP admin & health server", zap.String("addr", hs.server.Addr))
	if err := hs.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

func (hs *HTTPServer) Shutdown(ctx context.Context) error {
	hs.logger.Info("Shutting down HTTP server...")
	return hs.server.Shutdown(ctx)
}

func (hs *HTTPServer) handleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	resp := HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Version:   "1.0.0",
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		hs.logger.Error("Failed to write health response", zap.Error(err))
	}
}
