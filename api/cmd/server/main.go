package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/config"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/handler"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/middleware"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/repository"
	"github.com/ahmedfawzyjr/deep-stream/api/internal/service"
)

func main() {
	// Initialize slog
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	logger.Info("Starting DeepStream Prediction API...")

	// Load config
	cfg := config.Load()

	// Connect to database
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	conn, err := pgx.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("failed to connect to database", slog.Any("err", err))
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	logger.Info("Database connection established")

	// Run migrations
	if err := runMigrations(context.Background(), conn, logger); err != nil {
		logger.Error("failed to run database migrations", slog.Any("err", err))
		os.Exit(1)
	}
	logger.Info("Database migrations applied successfully")

	// Initialize components
	matchRepo := repository.NewMatchRepository(conn)
	inferClient := service.NewStubInferenceClient()
	predSvc := service.NewPredictionService(matchRepo, inferClient)
	hub := handler.NewHub()
	matchHandler := handler.NewMatchHandler(matchRepo, predSvc, hub)

	// Router setup
	r := chi.NewRouter()

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Logging & Rate Limiting Middlewares
	r.Use(middleware.Logging(logger))
	r.Use(middleware.RateLimit())

	// Health check & Prometheus metrics
	r.Get("/health", matchHandler.Health)
	r.Handle("/metrics", promhttp.Handler())

	// API v1 Routes
	r.Route("/v1", func(r chi.Router) {
		r.Get("/matches", matchHandler.List)
		r.Get("/matches/{id}", matchHandler.GetByID)
		r.Get("/ws/matches/{id}/live", hub.ServeWS)

		// Prediction trigger - protected by JWT
		r.With(middleware.Auth(cfg.JWTSecret)).Post("/matches/{id}/predict", matchHandler.Predict)
	})

	serverAddr := ":" + cfg.Port
	logger.Info("Server listening on " + serverAddr)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		logger.Error("server failed to start", slog.Any("err", err))
		os.Exit(1)
	}
}

func runMigrations(ctx context.Context, conn *pgx.Conn, logger *slog.Logger) error {
	migrations := []string{
		"migrations/001_create_matches.sql",
		"migrations/002_create_predictions.sql",
		"migrations/003_create_users.sql",
	}

	for _, path := range migrations {
		logger.Info("Running migration file", slog.String("path", path))
		content, err := os.ReadFile(path)
		if err != nil {
			// Try reading from relative directory depending on execution context
			// e.g. for testing we might need to go up
			content, err = os.ReadFile("../../" + path)
			if err != nil {
				return fmt.Errorf("failed to read migration file %s: %w", path, err)
			}
		}

		_, err = conn.Exec(ctx, string(content))
		if err != nil {
			return fmt.Errorf("migration run failed for %s: %w", path, err)
		}
	}

	return nil
}
