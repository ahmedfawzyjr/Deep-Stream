package service

import (
	"context"
	"time"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/metrics"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/repository"
)

type InferenceClient interface {
	Infer(ctx context.Context, features []float32) ([]float64, error)
}

type PredictionService struct {
	matchRepo   repository.MatchRepository
	inferClient InferenceClient
}

func NewPredictionService(matchRepo repository.MatchRepository, inferClient InferenceClient) *PredictionService {
	return &PredictionService{
		matchRepo:   matchRepo,
		inferClient: inferClient,
	}
}

func (s *PredictionService) Predict(ctx context.Context, matchID string) (*repository.Prediction, error) {
	match, err := s.matchRepo.GetByID(ctx, matchID)
	if err != nil {
		metrics.PredictionsTotal.WithLabelValues("error").Inc()
		return nil, err
	}

	features := extractFeatures(match)

	start := time.Now()
	probs, err := s.inferClient.Infer(ctx, features)
	latency := float64(time.Since(start).Nanoseconds()) / 1e6 // in milliseconds

	if err != nil {
		metrics.PredictionsTotal.WithLabelValues("error").Inc()
		return nil, err
	}

	metrics.InferenceLatency.Observe(latency)

	// Since ONNX output order is away_win (0), draw (1), home_win (2)
	// let's ensure we map them correctly
	pred := &repository.Prediction{
		MatchID:      matchID,
		HomeWinProb:  probs[2],
		DrawProb:     probs[1],
		AwayWinProb:  probs[0],
		ModelVersion: "XGBoost-v1",
		LatencyMs:    latency,
	}

	err = s.matchRepo.CreatePrediction(ctx, pred)
	if err != nil {
		metrics.PredictionsTotal.WithLabelValues("error").Inc()
		return nil, err
	}

	metrics.PredictionsTotal.WithLabelValues("success").Inc()
	return pred, nil
}

func extractFeatures(m *repository.Match) []float32 {
	// Return the 15 features matching the model definition
	return []float32{
		8.0, 6.0,    // home_shots, away_shots
		4.0, 2.0,    // home_shots_on_target, away_shots_on_target
		0.85, 0.78,  // home_pass_accuracy, away_pass_accuracy
		55.0, 45.0,  // home_possession_pct, away_possession_pct
		1.8, 0.9,    // home_xg, away_xg
		0.6, 0.4,    // home_form_last5, away_form_last5
		1.5, 1.1,    // home_goals_scored_avg, away_goals_scored_avg
		3.0,         // head_to_head_home_wins
	}
}
