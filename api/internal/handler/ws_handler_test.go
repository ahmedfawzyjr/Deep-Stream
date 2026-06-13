package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"

	"github.com/ahmedfawzyjr/deep-stream/api/internal/handler"
)

func TestWebSocketHub_Broadcast(t *testing.T) {
	hub := handler.NewHub()
	r := chi.NewRouter()
	r.Get("/ws/matches/{id}", hub.ServeWS)

	server := httptest.NewServer(r)
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http") + "/ws/matches/match1"

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	assert.NoError(t, err)
	defer conn.Close()

	time.Sleep(50 * time.Millisecond)

	msg := []byte(`{"prediction":"updated"}`)
	hub.Broadcast("match1", msg)

	conn.SetReadDeadline(time.Now().Add(500 * time.Millisecond))
	_, received, err := conn.ReadMessage()
	assert.NoError(t, err)
	assert.Equal(t, msg, received)
}
