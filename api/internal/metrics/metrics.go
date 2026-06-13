package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	PredictionsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "deepstream_predictions_total",
			Help: "Total number of predictions triggered.",
		},
		[]string{"status"},
	)

	InferenceLatency = promauto.NewHistogram(
		prometheus.HistogramOpts{
			Name:    "deepstream_inference_latency_ms",
			Help:    "Inference latency in milliseconds.",
			Buckets: []float64{1, 2, 5, 10, 20, 50, 100},
		},
	)

	ActiveWebsockets = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "deepstream_active_websockets",
			Help: "Current active WebSocket connections.",
		},
	)

	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "deepstream_http_requests_total",
			Help: "Total number of HTTP requests.",
		},
		[]string{"method", "path", "status"},
	)
)
