"use client";
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";

const MainPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<
    ReadableStreamDefaultReader<Uint8Array> | null | undefined
  >(null);

  const handleClick = () => {
    if (isConnected) {
      disconnectDevice();
    } else {
      connectToDevice();
    }
  };

  const connectToDevice = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setIsConnected(true);
      portRef.current = port;
      const reader = port.readable?.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let lineBuffer = "";
      console.log(isConnected); //Error : this is false somehow
      while (!isConnected) {
        const StreamData = await reader?.read();
        if (StreamData?.done) {
          console.log("Stream done");
          break;
        }
        const receivedData = decoder.decode(StreamData?.value, {
          stream: true,
        });
        const lines = (lineBuffer + receivedData).split("\n");
        lineBuffer = lines.pop() ?? "";
        for (const line of lines) {
          const dataValues = line.split(",");
          //   processData(dataValues);
          console.log(`Received Data: ${line}`);
        }
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
      disconnectDevice();
    }
  };

  const disconnectDevice = async () => {
    try {
      if (readerRef.current && portRef.current) {
        await readerRef.current.cancel();
        await portRef.current.close();
        readerRef.current.releaseLock();
      }
      setIsConnected(false);
      portRef.current = null;
      readerRef.current = null;
    } catch (error) {
      console.error("Error disconnecting from device:", error);
    }
  };

  const writeData = async (data: string) => {
    try {
      if (isConnected && portRef.current && portRef.current.writable) {
        const writer = portRef.current.writable.getWriter();
        const encoder = new TextEncoder();
        const dataToSend = encoder.encode(`${data}\n`);
        await writer.write(dataToSend);
        writer.releaseLock();
        console.log("Data sent");
      } else {
        alert("Device not connected");
      }
    } catch (error) {
      console.error("Error writing data to device:", error);
    }
  };

  return (
    <div className="flex h-[80%] justify-center items-center">
      <div className="flex gap-4">
        <Button className="bg-primary" onClick={handleClick}>
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
        <Button className="bg-primary" onClick={() => writeData("n")}>
          Write
        </Button>
      </div>
    </div>
  );
};

export default MainPage;
