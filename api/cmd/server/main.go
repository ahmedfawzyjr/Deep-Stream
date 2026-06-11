package main

import (
	"log"
	"net/http"

	"deepkick-api/internal/handlers"
	"deepkick-api/internal/server"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("⚽ Starting DeepKick Go Prediction API...")
	
	r := gin.Default()
	
	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	predictionHandler := handlers.NewPredictionHandler()

	// API Group
	v1 := r.Group("/v1")
	{
		v1.GET("/match/:id/predict", predictionHandler.PredictMatch)
		v1.GET("/match/:id/live", predictionHandler.LiveMatchStream)
		v1.GET("/player/:id/form", predictionHandler.PlayerForm)
		v1.GET("/world-cup/standings", predictionHandler.WorldCupStandings)
		v1.GET("/world-cup/bracket", predictionHandler.WorldCupBracket)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "deepkick-go-api",
		})
	})

	srv := server.NewHttpServer(r)
	if err := srv.Start(":8080"); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
