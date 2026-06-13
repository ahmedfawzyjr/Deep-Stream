package service

import (
	"context"
	"math/rand"
	"time"
)

type StubInferenceClient struct {
	rng *rand.Rand
}

func NewStubInferenceClient() InferenceClient {
	return &StubInferenceClient{
		rng: rand.New(rand.NewSource(time.Now().UnixNano())),
	}
}

func (c *StubInferenceClient) Infer(ctx context.Context, features []float32) ([]float64, error) {
	// Output probabilities corresponding to:
	// index 0: away win, index 1: draw, index 2: home win
	pAway := 0.15 + c.rng.Float64()*0.25
	pDraw := 0.20 + c.rng.Float64()*0.15
	pHome := 1.0 - pAway - pDraw

	return []float64{pAway, pDraw, pHome}, nil
}
