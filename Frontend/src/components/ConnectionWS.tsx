import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";

interface WebSocketMessage {
  type: "port_detected" | "stream_status" | "serial_data" | "error";
  port?: string;
  status?: "started" | "stopped";
  data?: string;
  message?: string;
}

const ArduinoControl: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    socketRef.current = new WebSocket("ws://localhost:8000/ws/arduino/");

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
    };

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data: WebSocketMessage = JSON.parse(event.data);

      switch (data.type) {
        case "port_detected":
          console.log("Port Detected:", data.port);
          break;
        case "stream_status":
          setIsStreaming(data.status === "started");
          console.log("Stream Status:", data.status);
          break;
        case "serial_data":
          console.log("Serial Data:", data.data);
          break;
        case "error":
          console.error("Error:", data.message);
          break;
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setIsStreaming(false);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const sendCommand = useCallback((command: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ command }));
      console.log(`Sent command: ${command}`);
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  const handleStreamToggle = useCallback(() => {
    sendCommand(isStreaming ? "stop" : "start");
  }, [isStreaming, sendCommand]);

  const handleDisconnect = useCallback(() => {
    sendCommand("disconnect");
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, [sendCommand]);

  return (
    <div className="flex h-14 items-center justify-between px-4">
      <Button onClick={handleStreamToggle} disabled={!isConnected}>
        {isStreaming ? "Stop Stream" : "Start Stream"}
      </Button>
      <Button
        onClick={handleDisconnect}
        disabled={!isConnected}
        variant="destructive"
      >
        Disconnect
      </Button>
    </div>
  );
};

export default ArduinoControl;
