package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/repository"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/service"
)

type MatchHandler struct {
	repo    repository.MatchRepository
	predSvc *service.PredictionService
	hub     *Hub
}

func NewMatchHandler(repo repository.MatchRepository, predSvc *service.PredictionService, hub *Hub) *MatchHandler {
	return &MatchHandler{
		repo:    repo,
		predSvc: predSvc,
		hub:     hub,
	}
}

type JSONError struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}

func writeError(w http.ResponseWriter, message string, code string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(JSONError{Error: message, Code: code})
}

func (h *MatchHandler) Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok","version":"1.0.0"}`))
}

func (h *MatchHandler) List(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 10
	offset := 0

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	matches, err := h.repo.List(r.Context(), limit, offset)
	if err != nil {
		writeError(w, err.Error(), "INTERNAL_ERROR", http.StatusInternalServerError)
		return
	}

	if matches == nil {
		matches = make([]*repository.Match, 0)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

func (h *MatchHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, "missing match id", "INVALID_ID", http.StatusBadRequest)
		return
	}

	match, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			writeError(w, "match not found", "NOT_FOUND", http.StatusNotFound)
			return
		}
		writeError(w, err.Error(), "INTERNAL_ERROR", http.StatusInternalServerError)
		return
	}

	pred, err := h.repo.GetLatestPrediction(r.Context(), id)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		writeError(w, err.Error(), "INTERNAL_ERROR", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"match":      match,
		"prediction": pred,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *MatchHandler) Predict(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, "missing match id", "INVALID_ID", http.StatusBadRequest)
		return
	}

	pred, err := h.predSvc.Predict(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			writeError(w, "match not found", "NOT_FOUND", http.StatusNotFound)
			return
		}
		writeError(w, err.Error(), "INTERNAL_ERROR", http.StatusInternalServerError)
		return
	}

	// Broadcast prediction update to WebSocket clients
	payload, err := json.Marshal(pred)
	if err == nil {
		h.hub.Broadcast(id, payload)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pred)
}
