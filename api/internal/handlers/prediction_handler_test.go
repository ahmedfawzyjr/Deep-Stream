package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestPredictMatch(t *testing.T) {
	// Setup Gin router in Test mode
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	
	h := NewPredictionHandler()
	r.GET("/v1/match/:id/predict", h.PredictMatch)

	// Create test request
	req, _ := http.NewRequest("GET", "/v1/match/wc_match_01/predict", nil)
	w := httptest.NewRecorder()
	
	// Perform request
	r.ServeHTTP(w, req)

	// Assert response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response["match_id"] != "wc_match_01" {
		t.Errorf("Expected match_id 'wc_match_01', got %v", response["match_id"])
	}

	if _, ok := response["win_probability"]; !ok {
		t.Error("Missing win_probability in prediction response")
	}
}

func TestPlayerForm(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	
	h := NewPredictionHandler()
	r.GET("/v1/player/:id/form", h.PlayerForm)

	req, _ := http.NewRequest("GET", "/v1/player/messi_10/form", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response["player_id"] != "messi_10" {
		t.Errorf("Expected player_id 'messi_10', got %v", response["player_id"])
	}
}

func TestWorldCupStandings(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	
	h := NewPredictionHandler()
	r.GET("/v1/world-cup/standings", h.WorldCupStandings)

	req, _ := http.NewRequest("GET", "/v1/world-cup/standings", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response []interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response array: %v", err)
	}

	if len(response) == 0 {
		t.Error("Expected standings list, got empty list")
	}
}
