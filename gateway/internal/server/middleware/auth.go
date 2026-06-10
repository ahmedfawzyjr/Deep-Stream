package middleware

import (
	"context"
	"errors"
	"strings"

	"deepstream/gateway/internal/ingest"
	"google.golang.org/grpc/metadata"
)

type AuthMiddleware struct {
	validator *ingest.Validator
}

func NewAuthMiddleware(validator *ingest.Validator) *AuthMiddleware {
	return &AuthMiddleware{
		validator: validator,
	}
}

// AuthenticateGRPC intercepts gRPC calls and extracts metadata user info.
func (am *AuthMiddleware) AuthenticateGRPC(ctx context.Context) (*ingest.JWTClaims, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errors.New("missing metadata in request context")
	}

	authHeaders := md.Get("authorization")
	if len(authHeaders) == 0 {
		return nil, errors.New("authorization header is missing")
	}

	claims, err := am.validator.ValidateJWT(authHeaders[0])
	if err != nil {
		return nil, err
	}

	return claims, nil
}

// AuthenticateHTTP is a helper for HTTP request auth extraction.
func (am *AuthMiddleware) AuthenticateHTTP(authHeader string) (*ingest.JWTClaims, error) {
	if authHeader == "" {
		return nil, errors.New("empty auth header")
	}
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return nil, errors.New("invalid authorization header scheme")
	}

	return am.validator.ValidateJWT(authHeader)
}
