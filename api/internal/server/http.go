package server

import (
	"context"
	"log"
	"net/http"
	"time"
)

type HttpServer struct {
	server *http.Server
}

func NewHttpServer(handler http.Handler) *HttpServer {
	return &HttpServer{
		server: &http.Server{
			Handler:      handler,
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
		},
	}
}

func (s *HttpServer) Start(addr string) error {
	s.server.Addr = addr
	log.Printf("Listening on %s...", addr)
	return s.server.ListenAndServe()
}

func (s *HttpServer) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}
