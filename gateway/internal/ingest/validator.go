package ingest

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Validator struct {
	jwtSecret []byte
}

type JWTClaims struct {
	UserID string `json:"sub"`
	Role   string `json:"role"`
	Exp    int64  `json:"exp"`
}

func NewValidator(secret string) *Validator {
	return &Validator{
		jwtSecret: []byte(secret),
	}
}

// ValidateJWT parses and verifies a JWT token.
func (v *Validator) ValidateJWT(tokenStr string) (*JWTClaims, error) {
	// Remove Bearer prefix if present
	tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	tokenStr = strings.TrimSpace(tokenStr)

	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	// Verify signature
	headerAndPayload := parts[0] + "." + parts[1]
	expectedSig := hmacSha256(headerAndPayload, v.jwtSecret)
	
	actualSig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, fmt.Errorf("failed to decode signature: %w", err)
	}

	if !hmac.Equal(actualSig, expectedSig) {
		return nil, errors.New("invalid signature")
	}

	// Decode payload
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode payload: %w", err)
	}

	var claims JWTClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claims: %w", err)
	}

	// Verify expiration
	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}

	return &claims, nil
}

// ValidateFrame validates incoming video frames.
func (v *Validator) ValidateFrame(pipelineID string, data []byte, width, height int32) error {
	if pipelineID == "" {
		return errors.New("pipeline ID cannot be empty")
	}
	if len(data) == 0 {
		return errors.New("frame data cannot be empty")
	}
	if width <= 0 || height <= 0 {
		return errors.New("invalid frame dimensions")
	}
	// Limit size to prevent memory attacks (e.g. max 10MB per frame)
	if len(data) > 10*1024*1024 {
		return errors.New("frame exceeds maximum allowed size (10MB)")
	}
	return nil
}

// ValidateAudio validates incoming audio chunks.
func (v *Validator) ValidateAudio(pipelineID string, data []byte, sampleRate int32) error {
	if pipelineID == "" {
		return errors.New("pipeline ID cannot be empty")
	}
	if len(data) == 0 {
		return errors.New("audio data cannot be empty")
	}
	if sampleRate != 8000 && sampleRate != 16000 && sampleRate != 44100 && sampleRate != 48000 {
		return errors.New("unsupported sample rate")
	}
	// Limit size (e.g. max 5MB per chunk)
	if len(data) > 5*1024*1024 {
		return errors.New("audio chunk exceeds maximum allowed size (5MB)")
	}
	return nil
}

func hmacSha256(message string, secret []byte) []byte {
	h := hmac.New(sha256.New, secret)
	h.Write([]byte(message))
	return h.Sum(nil)
}
