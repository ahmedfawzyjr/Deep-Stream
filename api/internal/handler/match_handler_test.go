package handler_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/handler"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/repository"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/service"
)

type MockMatchRepository struct {
	mock.Mock
}

func (m *MockMatchRepository) GetByID(ctx context.Context, id string) (*repository.Match, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.Match), args.Error(1)
}

func (m *MockMatchRepository) List(ctx context.Context, limit, offset int) ([]*repository.Match, error) {
	args := m.Called(ctx, limit, offset)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*repository.Match), args.Error(1)
}

func (m *MockMatchRepository) Create(ctx context.Context, match *repository.Match) error {
	args := m.Called(ctx, match)
	return args.Error(0)
}

func (m *MockMatchRepository) UpdateScore(ctx context.Context, id string, homeScore, awayScore int, status string) error {
	args := m.Called(ctx, id, homeScore, awayScore, status)
	return args.Error(0)
}

func (m *MockMatchRepository) CreatePrediction(ctx context.Context, pred *repository.Prediction) error {
	args := m.Called(ctx, pred)
	return args.Error(0)
}

func (m *MockMatchRepository) GetLatestPrediction(ctx context.Context, matchID string) (*repository.Prediction, error) {
	args := m.Called(ctx, matchID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.Prediction), args.Error(1)
}

type MockInferenceClient struct {
	mock.Mock
}

func (m *MockInferenceClient) Infer(ctx context.Context, features []float32) ([]float64, error) {
	args := m.Called(ctx, features)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]float64), args.Error(1)
}

func TestHealth(t *testing.T) {
	h := handler.NewMatchHandler(nil, nil, nil)
	req := httptest.NewRequest("GET", "/health", nil)
	rr := httptest.NewRecorder()

	h.Health(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.JSONEq(t, `{"status":"ok","version":"1.0.0"}`, rr.Body.String())
}

func TestList_Success(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	matches := []*repository.Match{
		{ID: "m1", HomeTeam: "A", AwayTeam: "B", Competition: "La Liga", MatchDate: time.Now()},
	}
	mockRepo.On("List", mock.Anything, 10, 0).Return(matches, nil)

	h := handler.NewMatchHandler(mockRepo, nil, nil)
	req := httptest.NewRequest("GET", "/v1/matches?limit=10&offset=0", nil)
	rr := httptest.NewRecorder()

	r := chi.NewRouter()
	r.Get("/v1/matches", h.List)
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	var resp []*repository.Match
	json.NewDecoder(rr.Body).Decode(&resp)
	assert.Len(t, resp, 1)
	assert.Equal(t, "A", resp[0].HomeTeam)
}

func TestGetByID_Success(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	match := &repository.Match{ID: "m1", HomeTeam: "A", AwayTeam: "B"}
	pred := &repository.Prediction{MatchID: "m1", HomeWinProb: 0.6, DrawProb: 0.2, AwayWinProb: 0.2}

	mockRepo.On("GetByID", mock.Anything, "m1").Return(match, nil)
	mockRepo.On("GetLatestPrediction", mock.Anything, "m1").Return(pred, nil)

	h := handler.NewMatchHandler(mockRepo, nil, nil)
	req := httptest.NewRequest("GET", "/v1/matches/m1", nil)
	rr := httptest.NewRecorder()

	r := chi.NewRouter()
	r.Get("/v1/matches/{id}", h.GetByID)
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	var resp map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&resp)
	assert.Contains(t, resp, "match")
	assert.Contains(t, resp, "prediction")
}

func TestGetByID_NotFound(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	mockRepo.On("GetByID", mock.Anything, "m-bad").Return((*repository.Match)(nil), repository.ErrNotFound)

	h := handler.NewMatchHandler(mockRepo, nil, nil)
	req := httptest.NewRequest("GET", "/v1/matches/m-bad", nil)
	rr := httptest.NewRecorder()

	r := chi.NewRouter()
	r.Get("/v1/matches/{id}", h.GetByID)
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusNotFound, rr.Code)
}

func TestPredict_Success(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	mockInfer := new(MockInferenceClient)
	hub := handler.NewHub()

	match := &repository.Match{ID: "m1", HomeTeam: "A", AwayTeam: "B"}
	mockRepo.On("GetByID", mock.Anything, "m1").Return(match, nil)
	mockInfer.On("Infer", mock.Anything, mock.Anything).Return([]float64{0.2, 0.3, 0.5}, nil)
	mockRepo.On("CreatePrediction", mock.Anything, mock.Anything).Return(nil)

	predSvc := service.NewPredictionService(mockRepo, mockInfer)
	h := handler.NewMatchHandler(mockRepo, predSvc, hub)

	req := httptest.NewRequest("POST", "/v1/matches/m1/predict", nil)
	rr := httptest.NewRecorder()

	r := chi.NewRouter()
	r.Post("/v1/matches/{id}/predict", h.Predict)
	r.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusCreated, rr.Code)
	var resp repository.Prediction
	json.NewDecoder(rr.Body).Decode(&resp)
	assert.Equal(t, "m1", resp.MatchID)
	assert.Equal(t, 0.5, resp.HomeWinProb)
}
