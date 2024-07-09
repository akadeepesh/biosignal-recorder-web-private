"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Cable,
  Circle,
  CircleStop,
  CircleX,
  FileArchive,
  FileDown,
} from "lucide-react";
import { vendorsList } from "./vendors";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BitSelection } from "./DataPass";

interface ConnectionProps {
  LineData: Function;
  Connection: (isConnected: boolean) => void;
  selectedBits: BitSelection;
  setSelectedBits: React.Dispatch<React.SetStateAction<BitSelection>>;
}

const Connection: React.FC<ConnectionProps> = ({
  LineData,
  Connection,
  selectedBits,
  setSelectedBits,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const [buffer, setBuffer] = useState<string[][]>([]);
  const [datasets, setDatasets] = useState<string[][][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [startTimeString, setStartTimeString] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<
    ReadableStreamDefaultReader<Uint8Array> | null | undefined
  >(null);

  const handleBitSelection = (value: string) => {
    setSelectedBits(value as BitSelection);
  };

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
      Connection(true);
      setIsConnected(true);
      isConnectedRef.current = true;
      portRef.current = port;
      const reader = port.readable?.getReader();
      readerRef.current = reader;
      readData();
      const wakeLock = await navigator.wakeLock.request("screen");
    } catch (error) {
      disconnectDevice();
      isConnectedRef.current = false;
      setIsConnected(false);
      portRef.current = null;
      console.error("Error connecting to device:", error);
    }
  };

  const disconnectDevice = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (error) {
      console.error("Error during disconnection:", error);
    } finally {
      setIsConnected(false);
      Connection(false);
      isConnectedRef.current = false;
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const readData = async () => {
    const decoder = new TextDecoder();
    let lineBuffer = "";
    while (isConnectedRef.current) {
      try {
        const StreamData = await readerRef.current?.read();
        if (StreamData?.done) {
          console.log("Thank you for using our app!");
          break;
        }
        const receivedData = decoder.decode(StreamData?.value, {
          stream: true,
        });
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
      } catch (error) {
        console.error("Error reading from device:", error);
        break;
      }
    }
    await disconnectDevice();
  };

  const columnNames = [
    "Counter",
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
        const now = new Date();
        setStartTime(now.getTime());
        setStartTimeString(now.toLocaleTimeString());
        setIsRecording(true);
        setElapsedTime(0);
        timerIntervalRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
        isRecordingRef.current = true;
      }
    } else {
      toast("No device is connected");
    }
  };

  const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    if (minutes === 0) {
      return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${
      seconds !== 1 ? "s" : ""
    }`;
  };

  const stopRecording = () => {
    if (startTime === null) {
      toast("Error: Start time was not set properly.");
      return;
    }

    if (buffer.length > 0) {
      const data = buffer;
      setDatasets((prevDatasets) => [...prevDatasets, data]);
      setBuffer([]);
    }

    const endTime = new Date();
    const endTimeString = endTime.toLocaleTimeString();
    const durationInSeconds = Math.round(
      (endTime.getTime() - startTime) / 1000
    );

    setIsRecording(false);
    isRecordingRef.current = false;

    const formattedDuration = formatDuration(durationInSeconds);

    toast("Recording completed Successfully", {
      description: (
        <div className="mt-2 flex flex-col space-y-1">
          <p>Start Time: {startTimeString}</p>
          <p>End Time: {endTimeString}</p>
          <p>RecordingDuration: {formattedDuration}</p>
          <p>Stored Recorded Files: {datasets.length + 1}</p>
        </div>
      ),
    });
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setStartTime(null);
    setStartTimeString("");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const saveData = async () => {
    if (datasets.length === 1) {
      const csvData = convertToCSV(datasets[0]);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "data.csv");
    } else if (datasets.length > 1) {
      const zip = new JSZip();
      datasets.forEach((data, index) => {
        const csvData = convertToCSV(data);
        zip.file(`data${index + 1}.csv`, csvData);
      });
      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(zipContent, "datasets.zip");
    } else {
      toast("No data available to download.");
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
      } else {
        toast("No device is connected");
      }
    } catch (error) {
      console.error("Error writing data to device:", error);
    }
  };

  return (
    <div className="flex h-14 items-center justify-between px-4">
      <div className="flex-1">
        {isRecording && (
          <span className="text-destructive font-bold">
            Recording: {formatTime(elapsedTime)}
          </span>
        )}
      </div>
      <div className="flex gap-4 flex-1 justify-center">
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
        {isConnected && (
          <div className="">
            <Select
              onValueChange={(value) => handleBitSelection(value)}
              value={selectedBits}
            >
              <SelectTrigger className="w-32 text-background bg-primary">
                <SelectValue placeholder="Select bits" />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="ten">10 bits</SelectItem>
                <SelectItem value="twelve">12 bits</SelectItem>
                <SelectItem value="fourteen">14 bits</SelectItem>
                <SelectItem value="auto">Auto Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {isConnected && (
          <TooltipProvider>
            <Tooltip>
              <Button onClick={handleRecord}>
                <TooltipTrigger asChild>
                  {isRecording ? <CircleStop /> : <Circle fill="red" />}
                </TooltipTrigger>
              </Button>
              <TooltipContent>
                <p>{!isRecording ? "Start Recording" : "Stop Recording"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {datasets.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <Button onClick={saveData}>
                <TooltipTrigger asChild>
                  {datasets.length === 1 ? (
                    <FileDown />
                  ) : (
                    <span className="flex flex-row justify-center items-center">
                      <FileArchive />
                      <p className=" text-lg">{`(${datasets.length})`}</p>
                    </span>
                  )}
                </TooltipTrigger>
              </Button>
              <TooltipContent>
                {datasets.length === 1 ? (
                  <p>Save As CSV</p>
                ) : (
                  <p>Save As Zip</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex-1"></div>
    </div>
  );
};

export default Connection;
