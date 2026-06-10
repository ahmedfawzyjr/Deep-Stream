package protocol

import (
	"errors"
	"fmt"
	"io"
	"net"

	"go.uber.org/zap"
)

type RtmpIngester struct {
	addr   string
	logger *zap.Logger
}

func NewRtmpIngester(addr string, logger *zap.Logger) *RtmpIngester {
	return &RtmpIngester{
		addr:   addr,
		logger: logger,
	}
}

// StartListening binds to the RTMP address and mock listens.
func (ri *RtmpIngester) StartListening(ctx context.Context, frameChan chan []byte) error {
	listener, err := net.Listen("tcp", ri.addr)
	if err != nil {
		return fmt.Errorf("failed to bind RTMP listener: %w", err)
	}
	defer listener.Close()

	ri.logger.Info("RTMP Ingester listening", zap.String("addr", ri.addr))

	go func() {
		<-ctx.Done()
		listener.Close()
	}()

	for {
		conn, err := listener.Accept()
		if err != nil {
			select {
			case <-ctx.Done():
				return nil
			default:
				ri.logger.Error("RTMP listener accept failure", zap.Error(err))
				return err
			}
		}

		go ri.handleConnection(conn, frameChan)
	}
}

func (ri *RtmpIngester) handleConnection(conn net.Conn, frameChan chan []byte) {
	defer conn.Close()
	ri.logger.Info("New RTMP connection accepted", zap.String("remote_addr", conn.RemoteAddr().String()))

	// Mock packet reader
	buffer := make([]byte, 4096)
	for {
		n, err := conn.Read(buffer)
		if err != nil {
			if errors.Is(err, io.EOF) {
				ri.logger.Info("RTMP client disconnected")
			} else {
				ri.logger.Error("RTMP socket read failure", zap.Error(err))
			}
			return
		}

		// Emulate frame extraction from RTMP stream packet payload
		if n > 0 {
			extractedMockFrame := make([]byte, n)
			copy(extractedMockFrame, buffer[:n])
			select {
			case frameChan <- extractedMockFrame:
			default:
				ri.logger.Warn("Ingestion queue full, dropping mock RTMP frame")
			}
		}
	}
}
