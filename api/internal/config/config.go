package config

import (
	"os"
)

type Config struct {
	DatabaseURL   string
	Port          string
	JWTSecret     string
	InferenceAddr string
}

func Load() *Config {
	return &Config{
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/deepstream?sslmode=disable"),
		Port:          getEnv("PORT", "8080"),
		JWTSecret:     getEnv("JWT_SECRET", "super-secret-change-me-in-production"),
		InferenceAddr: getEnv("INFERENCE_ADDR", "localhost:50051"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
