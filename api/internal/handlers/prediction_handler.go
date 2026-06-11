package handlers

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type PredictionHandler struct{}

func NewPredictionHandler() *PredictionHandler {
	return &PredictionHandler{}
}

func (h *PredictionHandler) PredictMatch(c *gin.Context) {
	matchId := c.Param("id")
	
	// Mock prediction output matching Rust inference structure
	c.JSON(http.StatusOK, gin.H{
		"match_id":         matchId,
		"win_probability":  0.485,
		"draw_probability": 0.280,
		"loss_probability": 0.235,
		"confidence":       0.720,
		"key_factors": []string{
			"Stellar team/player form (+15% Win probability)",
			"Opponent suffers from high travel fatigue",
		},
		"timestamp": time.Now().Unix(),
	})
}

func (h *PredictionHandler) PlayerForm(c *gin.Context) {
	playerId := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"player_id":     playerId,
		"form_rating":   7.45,
		"last_5_scores": []float64{7.2, 7.8, 6.9, 8.1, 7.3},
	})
}

func (h *PredictionHandler) WorldCupStandings(c *gin.Context) {
	c.JSON(http.StatusOK, []gin.H{
		{"group": "Group A", "teams": []gin.H{
			{"name": "Argentina", "points": 9, "played": 3, "gd": 5},
			{"name": "Senegal", "points": 6, "played": 3, "gd": 2},
			{"name": "Canada", "points": 3, "played": 3, "gd": -2},
			{"name": "Ireland", "points": 0, "played": 3, "gd": -5},
		}},
		{"group": "Group B", "teams": []gin.H{
			{"name": "France", "points": 7, "played": 3, "gd": 4},
			{"name": "USA", "points": 5, "played": 3, "gd": 1},
			{"name": "Japan", "points": 4, "played": 3, "gd": 0},
			{"name": "Ecuador", "points": 0, "played": 3, "gd": -5},
		}},
	})
}

func (h *PredictionHandler) WorldCupBracket(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"round_of_16": []gin.H{
			{"match_id": "wc_r16_1", "team_a": "Argentina", "team_b": "USA", "predicted_winner": "Argentina"},
			{"match_id": "wc_r16_2", "team_a": "France", "team_b": "Senegal", "predicted_winner": "France"},
		},
		"quarter_finals": []gin.H{
			{"match_id": "wc_qf_1", "team_a": "Argentina", "team_b": "France", "predicted_winner": "Argentina"},
		},
	})
}

func (h *PredictionHandler) LiveMatchStream(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Websocket upgrade error: %v", err)
		return
	}
	defer ws.Close()

	log.Println("Client connected to live match socket")

	// Stream mock updates
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	teamAWins := 0.45
	teamBWins := 0.35

	for {
		select {
		case <-ticker.C:
			// Random walk for live odds & win probabilities
			change := (rand.Float64() - 0.5) * 0.05
			teamAWins += change
			teamBWins -= change

			// Ensure bounds
			if teamAWins < 0.05 {
				teamAWins = 0.05
			}
			if teamAWins > 0.95 {
				teamAWins = 0.95
			}
			drawProb := 1.0 - teamAWins - teamBWins
			if drawProb < 0.05 {
				drawProb = 0.05
				teamBWins = 1.0 - teamAWins - drawProb
			}

			payload := gin.H{
				"match_id":         c.Param("id"),
				"win_probability":  teamAWins,
				"draw_probability": drawProb,
				"loss_probability": teamBWins,
				"minute":           time.Now().Second() % 90,
				"xg": gin.H{
					"team_a": 1.25 + rand.Float64()*0.4,
					"team_b": 0.85 + rand.Float64()*0.3,
				},
				"momentum": (teamAWins - teamBWins) * 100.0,
			}

			if err := ws.WriteJSON(payload); err != nil {
				log.Println("Websocket write error (disconnected)")
				return
			}
		}
	}
}
