package protocol

import (
	"context"
	"fmt"
	"net"

	"go.uber.org/zap"
)

type SrtIngester struct {
	addr   string
	logger *zap.Logger
}

func NewSrtIngester(addr string, logger *zap.Logger) *SrtIngester {
	return &SrtIngester{
		addr:   addr,
		logger: logger,
	}
}

// StartListening starts listening on UDP port for SRT packets.
func (si *SrtIngester) StartListening(ctx context.Context, packetChan chan []byte) error {
	conn, err := net.ListenPacket("udp", si.addr)
	if err != nil {
		return fmt.Errorf("failed to bind UDP socket for SRT: %w", err)
	}
	defer conn.Close()

	si.logger.Info("SRT/UDP Ingester listening", zap.String("addr", si.addr))

	go func() {
		<-ctx.Done()
		conn.Close()
	}()

	buffer := make([]byte, 2048)
	for {
		n, remoteAddr, err := conn.ReadFrom(buffer)
		if err != nil {
			select {
			case <-ctx.Done():
				return nil
			default:
				si.logger.Error("SRT socket read failure", zap.Error(err))
				return err
			}
		}

		if n > 0 {
			si.logger.Debug("SRT packet received", zap.Int("bytes", n), zap.String("from", remoteAddr.String()))
			packet := make([]byte, n)
			copy(packet, buffer[:n])
			select {
			case packetChan <- packet:
			default:
				// Shed load on channel fullness
			}
		}
	}
}
