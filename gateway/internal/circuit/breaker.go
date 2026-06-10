package circuit

import (
	"log"
	"time"

	"github.com/sony/gobreaker"
)

type AntiGravityBreaker struct {
	breaker *gobreaker.CircuitBreaker
}

func NewAntiGravityBreaker(name string) *AntiGravityBreaker {
	settings := gobreaker.Settings{
		Name:        name,
		MaxRequests: 100,              // Max requests in half-open state
		Interval:    10 * time.Second, // Statistical window
		Timeout:     5 * time.Second,  // Request timeout

		// Trip breaker at 50% failure rate
		ReadyToTrip: func(counts gobreaker.Counts) bool {
			failureRatio := float64(counts.TotalFailures) / float64(counts.Requests)
			return counts.Requests >= 10 && failureRatio >= 0.5
		},

		// Cooldown before half-open
		OnStateChange: func(name string, from gobreaker.State, to gobreaker.State) {
			log.Printf("Breaker %s: %s -> %s", name, from, to)
		},
	}

	return &AntiGravityBreaker{
		breaker: gobreaker.NewCircuitBreaker(settings),
	}
}

func (agb *AntiGravityBreaker) Execute(req func() (interface{}, error)) (interface{}, error) {
	return agb.breaker.Execute(req)
}
