package middleware

import (
	"net/http"
	"time"

	"github.com/go-chi/httprate"
)

func RateLimit() func(http.Handler) http.Handler {
	return httprate.Limit(
		100,
		60*time.Second,
		httprate.WithKeyFunc(httprate.LimitByIP),
		httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error":"too many requests","code":"RATE_LIMIT_EXCEEDED"}`))
		}),
	)
}
