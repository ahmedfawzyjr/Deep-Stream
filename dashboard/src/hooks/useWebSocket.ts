import { useEffect, useState, useRef, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [data, setData] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log(`WebSocket connected to: ${url}`);
    };

    ws.onmessage = (event) => {
      setData(event.data);
    };

    ws.onclose = () => {
      setConnected(false);
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttemptsRef.current) * 1000;
        console.log(`WebSocket disconnected. Reconnecting in ${timeout}ms...`);
        setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, timeout);
      } else {
        console.error('WebSocket maximum reconnect attempts reached.');
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, connected };
}
