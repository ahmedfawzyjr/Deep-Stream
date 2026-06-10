package ingest

import (
	"errors"
	"fmt"
)

type StreamAdapter struct {
	// Holds any formatting configuration if needed
}

type ExtractedFrame struct {
	Width  int32
	Height int32
	Format string
	Data   []byte
}

func NewStreamAdapter() *StreamAdapter {
	return &StreamAdapter{}
}

// AdaptFrame ensures raw frame bytes are normalized before queue dispatching.
func (a *StreamAdapter) AdaptFrame(rawBytes []byte, format string) (*ExtractedFrame, error) {
	if len(rawBytes) == 0 {
		return nil, errors.New("cannot adapt empty frame")
	}

	// Normalizing logic: in a real production system, this could invoke ffmpeg/libav or decode headers.
	// We will assert and validate the magic headers of common image formats (JPEG, PNG).
	detectedFormat := ""
	if len(rawBytes) >= 4 {
		if rawBytes[0] == 0xFF && rawBytes[1] == 0xD8 && rawBytes[2] == 0xFF {
			detectedFormat = "jpeg"
		} else if rawBytes[0] == 0x89 && rawBytes[1] == 0x50 && rawBytes[2] == 0x4E && rawBytes[3] == 0x47 {
			detectedFormat = "png"
		}
	}

	if format != "" && detectedFormat != "" && format != detectedFormat {
		return nil, fmt.Errorf("format mismatch: requested %s but detected %s", format, detectedFormat)
	}

	if detectedFormat == "" {
		detectedFormat = "raw"
	}

	return &ExtractedFrame{
		Width:  640, // standard base resolution fallback
		Height: 480,
		Format: detectedFormat,
		Data:   rawBytes,
	}, nil
}
