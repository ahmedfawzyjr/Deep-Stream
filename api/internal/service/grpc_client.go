//go:build grpc

package service

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/pb"
)

type GrpcInferenceClient struct {
	addr string
}

func NewGrpcInferenceClient(addr string) InferenceClient {
	return &GrpcInferenceClient{addr: addr}
}

func (c *GrpcInferenceClient) Infer(ctx context.Context, features []float32) ([]float64, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	conn, err := grpc.DialContext(ctx, c.addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to inference server: %w", err)
	}
	defer conn.Close()

	client := pb.NewInferenceServiceClient(conn)

	resp, err := client.Predict(ctx, &pb.PredictRequest{
		MatchId:  "match_id",
		Features: features,
	})
	if err != nil {
		return nil, fmt.Errorf("gRPC predict failed: %w", err)
	}

	return []float64{
		float64(resp.AwayWinProb),
		float64(resp.DrawProb),
		float64(resp.HomeWinProb),
	}, nil
}
