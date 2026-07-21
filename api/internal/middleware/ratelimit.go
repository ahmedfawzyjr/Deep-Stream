package middleware

import (
	"net/http"
	"time"

	"github.com/go-chi/httprate"
)

func RateLimit() func(http.Handler) http.Handler {
	return httprate.LimitByIP(100, 1*time.Minute)
}
