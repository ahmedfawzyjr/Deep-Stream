package middleware

import (
	"sync"
	"time"
)

type TokenBucket struct {
	maxTokens     float64
	tokens        float64
	refillRate    float64
	lastRefilled  time.Time
	mu            sync.Mutex
}

func NewTokenBucket(maxTokens float64, refillRate float64) *TokenBucket {
	return &TokenBucket{
		maxTokens:    maxTokens,
		tokens:       maxTokens,
		refillRate:   refillRate,
		lastRefilled: time.Now(),
	}
}

func (tb *TokenBucket) Allow() bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(tb.lastRefilled).Seconds()
	tb.lastRefilled = now

	tb.tokens = tb.tokens + (elapsed * tb.refillRate)
	if tb.tokens > tb.maxTokens {
		tb.tokens = tb.maxTokens
	}

	if tb.tokens >= 1.0 {
		tb.tokens -= 1.0
		return true
	}

	return false
}

type RateLimiter struct {
	buckets map[string]*TokenBucket
	mu      sync.RWMutex
	maxTokens  float64
	refillRate float64
}

func NewRateLimiter(maxTokens float64, refillRate float64) *RateLimiter {
	return &RateLimiter{
		buckets:    make(map[string]*TokenBucket),
		maxTokens:  maxTokens,
		refillRate: refillRate,
	}
}

func (rl *RateLimiter) Allow(clientKey string) bool {
	rl.mu.RLock()
	bucket, exists := rl.buckets[clientKey]
	rl.mu.RUnlock()

	if !exists {
		rl.mu.Lock()
		// Double check
		bucket, exists = rl.buckets[clientKey]
		if !exists {
			bucket = NewTokenBucket(rl.maxTokens, rl.refillRate)
			rl.buckets[clientKey] = bucket
		}
		rl.mu.Unlock()
	}

	return bucket.Allow()
}
