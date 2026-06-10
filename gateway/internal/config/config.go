package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	GRPCPort             string
	HTTPPort             string
	KafkaBrokers         []string
	KafkaVideoTopic      string
	KafkaAudioTopic      string
	RedisAddr            string
	JWTSecret            string
	RateLimitMaxRequests int
	RateLimitFillInterval int // in seconds
}

func Load() *Config {
	brokers := strings.Split(getEnv("KAFKA_BROKERS", "localhost:9092"), ",")
	
	rateLimitMax, err := strconv.Atoi(getEnv("RATE_LIMIT_MAX_REQUESTS", "100"))
	if err != nil {
		rateLimitMax = 100
	}

	rateLimitInterval, err := strconv.Atoi(getEnv("RATE_LIMIT_FILL_INTERVAL", "1"))
	if err != nil {
		rateLimitInterval = 1
	}

	return &Config{
		GRPCPort:              getEnv("GRPC_PORT", "50051"),
		HTTPPort:              getEnv("HTTP_PORT", "8080"),
		KafkaBrokers:          brokers,
		KafkaVideoTopic:       getEnv("KAFKA_VIDEO_TOPIC", "deepstream-video-ingest"),
		KafkaAudioTopic:       getEnv("KAFKA_AUDIO_TOPIC", "deepstream-audio-ingest"),
		RedisAddr:             getEnv("REDIS_ADDR", "localhost:6379"),
		JWTSecret:             getEnv("JWT_SECRET", "super-secret-key-deepstream-2026"),
		RateLimitMaxRequests:  rateLimitMax,
		RateLimitFillInterval: rateLimitInterval,
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
