package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"

	"google.golang.org/grpc/metadata"
)

type TraceContext struct {
	TraceID string
	SpanID  string
}

// ExtractOrGenerateTraceID grabs tracing info from incoming metadata or builds a new one.
func ExtractOrGenerateTraceID(ctx context.Context) (context.Context, *TraceContext) {
	md, ok := metadata.FromIncomingContext(ctx)
	traceID := ""
	spanID := ""

	if ok {
		tIDs := md.Get("trace_id")
		if len(tIDs) > 0 {
			traceID = tIDs[0]
		}
		sIDs := md.Get("span_id")
		if len(sIDs) > 0 {
			spanID = sIDs[0]
		}
	}

	if traceID == "" {
		traceID = generateRandomHex(16) // 128-bit TraceID
	}
	if spanID == "" {
		spanID = generateRandomHex(8) // 64-bit SpanID
	}

	tc := &TraceContext{
		TraceID: traceID,
		SpanID:  spanID,
	}

	// Inject back into context metadata so downstream services receive it
	newMD := metadata.Pairs("trace_id", traceID, "span_id", spanID)
	if ok {
		newMD = metadata.Join(md, newMD)
	}
	newCtx := metadata.NewIncomingContext(ctx, newMD)

	return newCtx, tc
}

func generateRandomHex(bytesLen int) string {
	b := make([]byte, bytesLen)
	if _, err := rand.Read(b); err != nil {
		return "0000000000000000"
	}
	return hex.EncodeToString(b)
}
