module deepkick-api

go 1.20

require (
	github.com/gin-gonic/gin v1.9.0
	github.com/gorilla/websocket v1.5.0
	github.com/sony/gobreaker v0.5.0
	github.com/zsais/go-gin-prometheus v0.1.0
	go.opentelemetry.io/otel v1.17.0
	go.opentelemetry.io/otel/sdk v1.17.0
	go.opentelemetry.io/otel/trace v1.17.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.17.0
	go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin v0.42.0
)
