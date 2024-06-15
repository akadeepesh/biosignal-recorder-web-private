"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Cable, CircleX } from "lucide-react";
import { vendorsList } from "./vendors";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Connection = ({ LineData }: { LineData: Function }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const [buffer, setBuffer] = useState<string[][]>([]);
  const [datasets, setDatasets] = useState<string[][][]>([]);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<
    ReadableStreamDefaultReader<Uint8Array> | null | undefined
  >(null);

  useEffect(() => {
    if (isConnected && portRef.current?.getInfo()) {
      toast(
        `You are now Connected to ${formatPortInfo(
          portRef.current?.getInfo()!
        )}`
      );
    } else {
      toast("Disconnected from device");
    }
  }, [isConnected]);

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
    return `${vendorName} - Product ID: ${info.usbProductId}`;
  }

  const connectToDevice = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setIsConnected(true);
      isConnectedRef.current = true;
      portRef.current = port;
      const reader = port.readable?.getReader();
      readerRef.current = reader;
      readData();
    } catch (error) {
      console.error("Error connecting to device:", error);
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
      isConnectedRef.current = false;
      setIsRecording(false);
      isRecordingRef.current = false;
      portRef.current = null;
      readerRef.current = null;
    } catch (error) {
      console.error("Error disconnecting from device:", error);
    }
  };

  const readData = async () => {
    const decoder = new TextDecoder();
    let lineBuffer = "";
    while (isConnectedRef.current) {
      const StreamData = await readerRef.current?.read();
      if (StreamData?.done) {
        console.log("Thank you for using the app!");
        break;
      }
      const receivedData = decoder.decode(StreamData?.value, { stream: true });
      const lines = (lineBuffer + receivedData).split("\n");
      lineBuffer = lines.pop() ?? "";
      for (const line of lines) {
        const dataValues = line.split(",");
        if (dataValues.length === 1) {
          toast(`Received Data: ${line}`);
        } else {
          LineData(dataValues);
          if (isRecordingRef.current) {
            setBuffer((prevBuffer) => {
              const newBuffer = [...prevBuffer, dataValues];
              return newBuffer;
            });
          }
        }
      }
    }
  };

  const columnNames = [
    "Counter",
    "Timer",
    "Channel 1",
    "Channel 2",
    "Channel 3",
    "Channel 4",
    "Channel 5",
    "Channel 6",
  ];

  const convertToCSV = (buffer: string[][]): string => {
    const headerRow = columnNames.join(",");
    const rows = buffer.map((row) => row.map(Number).join(","));
    const csvData = [headerRow, ...rows].join("\n");
    return csvData;
  };

  const handleRecord = () => {
    if (isConnected) {
      if (isRecording) {
        stopRecording();
      } else {
        setIsRecording(true);
        isRecordingRef.current = true;
      }
    } else {
      toast("No device is connected");
    }
  };

  const stopRecording = () => {
    if (buffer.length > 0) {
      const data = buffer;
      setDatasets((prevDatasets) => {
        const newDatasets = [...prevDatasets, data];
        return newDatasets;
      });
      setBuffer([]);
    }
    setIsRecording(false);
    isRecordingRef.current = false;
  };

  const saveDataAsZip = async () => {
    const zip = new JSZip();
    datasets.forEach((data, index) => {
      const csvData = convertToCSV(data);
      zip.file(`data${index + 1}.csv`, csvData);
    });
    const zipContent = await zip.generateAsync({ type: "blob" });
    saveAs(zipContent, "datasets.zip");
  };

  const writeData = async (data: string) => {
    try {
      if (isConnected && portRef.current && portRef.current.writable) {
        const writer = portRef.current.writable.getWriter();
        const encoder = new TextEncoder();
        const dataToSend = encoder.encode(`${data}\n`);
        await writer.write(dataToSend);
        writer.releaseLock();
      } else {
        toast("No device is connected");
      }
    } catch (error) {
      console.error("Error writing data to device:", error);
    }
  };

  return (
    <div className="flex h-14 justify-center flex-col gap-4 items-center sticky bottom-0">
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
        <Button className="bg-primary" onClick={() => writeData("c")}>
          Write
        </Button>
        <Button onClick={handleRecord}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        <Button onClick={saveDataAsZip}>Save</Button>
      </div>
    </div>
  );
};

export default Connection;
