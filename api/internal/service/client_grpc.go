//go:build grpc

package service

func NewInferenceClient(addr string) InferenceClient {
	return NewGrpcInferenceClient(addr)
}
