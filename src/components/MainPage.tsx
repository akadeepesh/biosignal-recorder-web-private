"use client";
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Cable, CircleX } from "lucide-react";
import { vendorsList } from "./vendors";

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

  function formatPortInfo(info: SerialPortInfo) {
    if (!info || !info.usbVendorId) {
      return "Port with no info";
    }
    const vendorName =
      vendorsList.find((d) => parseInt(d.field_vid) === info.usbVendorId)
        ?.name ?? "Unknown Vendor";
    return vendorName + " - Product ID: " + info.usbProductId;
  }

  const connectToDevice = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setIsConnected(true);
      portRef.current = port;
      const reader = port.readable?.getReader();
      readerRef.current = reader;
      readData();
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

  const readData = async () => {
    const decoder = new TextDecoder();
    let lineBuffer = "";
    while (!isConnected) {
      const StreamData = await readerRef.current?.read();
      if (StreamData?.done) {
        console.log("Thank you for using the app!");
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
        console.log(`Received Data: ${dataValues}`);
      }
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
    <div className="flex h-[80%] justify-center flex-col gap-4 items-center">
      {isConnected ? (
        <div className="">
          You are now Connected to{" "}
          {portRef.current?.getInfo()
            ? formatPortInfo(portRef.current?.getInfo()!)
            : ""}
        </div>
      ) : (
        <div className=""></div>
      )}
      <div className="flex gap-4">
        <Button className="bg-primary gap-2" onClick={handleClick}>
          {isConnected ? (
            <>
              Disconnect
              <CircleX size={17} />
            </>
          ) : (
            <>
              Connect
              <Cable size={17} />
            </>
          )}
        </Button>
        <Button className="bg-primary" onClick={() => writeData("n")}>
          Write
        </Button>
      </div>
    </div>
  );
};

export default MainPage;
