package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

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

func TestPredict_Success(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	mockInfer := new(MockInferenceClient)

	match := &repository.Match{ID: "m-ok", HomeTeam: "Home", AwayTeam: "Away"}
	mockRepo.On("GetByID", mock.Anything, "m-ok").Return(match, nil)
	mockInfer.On("Infer", mock.Anything, mock.Anything).Return([]float64{0.20, 0.30, 0.50}, nil)
	mockRepo.On("CreatePrediction", mock.Anything, mock.Anything).Return(nil)

	svc := service.NewPredictionService(mockRepo, mockInfer)
	pred, err := svc.Predict(context.Background(), "m-ok")

	assert.NoError(t, err)
	assert.NotNil(t, pred)
	assert.Equal(t, "m-ok", pred.MatchID)
	assert.Equal(t, 0.50, pred.HomeWinProb)
	assert.Equal(t, 0.30, pred.DrawProb)
	assert.Equal(t, 0.20, pred.AwayWinProb)
	assert.True(t, pred.LatencyMs >= 0)

	mockRepo.AssertExpectations(t)
	mockInfer.AssertExpectations(t)
}

func TestPredict_GetMatchError(t *testing.T) {
	mockRepo := new(MockMatchRepository)
	mockInfer := new(MockInferenceClient)

	mockRepo.On("GetByID", mock.Anything, "m-fail").Return((*repository.Match)(nil), errors.New("db error"))

	svc := service.NewPredictionService(mockRepo, mockInfer)
	pred, err := svc.Predict(context.Background(), "m-fail")

	assert.Error(t, err)
	assert.Nil(t, pred)
}
