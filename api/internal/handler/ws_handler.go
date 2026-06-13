package handler

import (
	"log/slog"
	"net/http"
	"sync"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/metrics"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Hub struct {
	mu      sync.RWMutex
	clients map[string]map[*websocket.Conn]bool
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[string]map[*websocket.Conn]bool),
	}
}

func (h *Hub) Register(matchID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.clients[matchID]; !exists {
		h.clients[matchID] = make(map[*websocket.Conn]bool)
	}
	h.clients[matchID][conn] = true
	metrics.ActiveWebsockets.Inc()
	slog.Info("registered websocket client", slog.String("match_id", matchID))
}

func (h *Hub) Unregister(matchID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if conns, exists := h.clients[matchID]; exists {
		if _, ok := conns[conn]; ok {
			delete(conns, conn)
			conn.Close()
			metrics.ActiveWebsockets.Dec()
			slog.Info("unregistered websocket client", slog.String("match_id", matchID))
		}
		if len(conns) == 0 {
			delete(h.clients, matchID)
		}
	}
}

func (h *Hub) Broadcast(matchID string, payload []byte) {
	h.mu.RLock()
	conns, exists := h.clients[matchID]
	if !exists || len(conns) == 0 {
		h.mu.RUnlock()
		return
	}

	targets := make([]*websocket.Conn, 0, len(conns))
	for conn := range conns {
		targets = append(targets, conn)
	}
	h.mu.RUnlock()

	for _, conn := range targets {
		go func(c *websocket.Conn) {
			err := c.WriteMessage(websocket.TextMessage, payload)
			if err != nil {
				slog.Error("websocket write error, disconnecting client", slog.Any("err", err))
				h.Unregister(matchID, c)
			}
		}(conn)
	}
}

func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	matchID := chi.URLParam(r, "id")
	if matchID == "" {
		http.Error(w, "missing match id", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error("failed to upgrade websocket connection", slog.Any("err", err))
		return
	}

	h.Register(matchID, conn)
	defer h.Unregister(matchID, conn)

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}
