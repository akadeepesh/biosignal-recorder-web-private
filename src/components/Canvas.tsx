"use client";
import { Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { SmoothieChart, TimeSeries } from "smoothie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

const CanvasTry = ({ data }: { data: string }) => {
  const isClient = typeof window !== "undefined";

  const [speed, setSpeed] = useState(() => {
    if (isClient) {
      const storedSpeed = localStorage.getItem("speed");
      return storedSpeed ? storedSpeed : "two";
    }
    return "two";
  });

  const [height, setHeight] = useState(() => {
    if (isClient) {
      const storedHeight = localStorage.getItem("height");
      return storedHeight ? parseInt(storedHeight, 10) : 5;
    }
    return 5;
  });

  const [channels, setChannels] = useState(() => {
    if (isClient) {
      const storedChannels = localStorage.getItem("channels");
      return storedChannels
        ? JSON.parse(storedChannels)
        : [true, false, false, false, false, false];
    }
    return [true, false, false, false, false, false];
  });

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("speed", speed);
      localStorage.setItem("height", height.toString());
      localStorage.setItem("channels", JSON.stringify(channels));

      const speedElement = document.getElementById("speed-value");
      const heightElement = document.getElementById("height-value");
      const channelsElement = document.getElementById("channels-value");

      if (speedElement) speedElement.textContent = speed;
      if (heightElement) heightElement.textContent = height.toString();
      if (channelsElement)
        channelsElement.textContent = JSON.stringify(channels);
    }
  }, [speed, height, channels, isClient]);

  const handleChannelChange = (index: number) => {
    setChannels((prevChannels: any) => {
      const updatedChannels = [...prevChannels];
      updatedChannels[index] = !prevChannels[index];
      return updatedChannels;
    });
  };

  const chartRef = useRef<SmoothieChart | null>(null);
  const seriesRef = useRef<TimeSeries | null>(null);
  const [isChartInitialized, setIsChartInitialized] = useState(false);

  useEffect(() => {
    if (!isChartInitialized) {
      const canvas = document.getElementById(
        "smoothie-chart"
      ) as HTMLCanvasElement;
      const chart = new SmoothieChart({
        millisPerPixel: 10,
        maxDataSetLength: 100,
        maxValueScale: 1.1,
        minValueScale: 1,
        interpolation: "bezier",
        grid: {
          borderVisible: true,
          millisPerLine: 10000,
          lineWidth: 1,
          fillStyle: "rgba(2, 8, 23)",
          verticalSections: 0,
        },
        tooltip: true,
        tooltipLine: { lineWidth: 1, strokeStyle: "#fffff" },
        title: {
          text: "Test Data",
          fontSize: 16,
          fillStyle: "#ffffff",
          verticalAlign: "bottom",
        },
      });
      const series = new TimeSeries();

      chart.addTimeSeries(series, {
        strokeStyle: "rgba(0, 255, 0, 0.8)",
        lineWidth: 1,
      });

      chart.streamTo(canvas, 500);

      chartRef.current = chart;
      seriesRef.current = series;
      setIsChartInitialized(true);
    }
  }, [isChartInitialized]);

  useEffect(() => {
    if (isChartInitialized) {
      const series = seriesRef.current;
      const lines = String(data).split("\n");
      for (const line of lines) {
        if (line.trim() !== "") {
          const sensorValues = line.split(",").map(Number).slice(2);
          const data = sensorValues[0];
          if (!isNaN(data)) {
            series?.append(Date.now(), data);
          }
        }
      }
    }
  }, [data, isChartInitialized]);

  return (
    <div className="flex justify-center items-center flex-col h-[85%] w-screen">
      <div className="flex w-[70%] h-min justify-end items-center pb-1">
        <Dialog>
          <DialogTrigger className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm p-2">
            <Settings size={20} opacity={0.5} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <Separator />
            </DialogHeader>
            <div className="flex flex-col gap-10">
              <div className="flex flex-row gap-20 mt-5 items-center">
                <div className="">Speed</div>
                <RadioGroup
                  defaultValue="two"
                  value={speed}
                  onValueChange={setSpeed}
                  className="flex flex-row gap-20"
                >
                  <div className="flex justify-center items-center gap-2">
                    <Label>1</Label>
                    <RadioGroupItem value="one" id="one" />
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <Label>2</Label>
                    <RadioGroupItem value="two" id="two" />
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <Label>3</Label>
                    <RadioGroupItem value="three" id="three" />
                  </div>
                </RadioGroup>
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="">Height</div>
                <Slider
                  defaultValue={[5]}
                  value={[height]}
                  onValueChange={([value]) => setHeight(value)}
                  max={10}
                  step={1}
                  className=" ml-16"
                />
                <Button
                  disabled
                  variant={"outline"}
                  size={"sm"}
                  className="flex mr-5 border-primary"
                >
                  {height}
                </Button>
              </div>
              <div className="flex flex-row gap-14 items-center">
                <div className="">Channels</div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-5">
                    <Label>CH-1</Label>
                    <Checkbox
                      checked={channels[0]}
                      onCheckedChange={() => handleChannelChange(0)}
                    />
                    <Label>CH-2</Label>
                    <Checkbox
                      checked={channels[1]}
                      onCheckedChange={() => handleChannelChange(1)}
                    />
                    <Label>CH-3</Label>
                    <Checkbox
                      checked={channels[2]}
                      onCheckedChange={() => handleChannelChange(2)}
                    />
                  </div>
                  <div className="flex flex-row justify-evenly">
                    <Label>CH-4</Label>
                    <Checkbox
                      checked={channels[3]}
                      onCheckedChange={() => handleChannelChange(3)}
                    />
                    <Label>CH-5</Label>
                    <Checkbox
                      checked={channels[4]}
                      onCheckedChange={() => handleChannelChange(4)}
                    />
                    <Label>CH-6</Label>
                    <Checkbox
                      checked={channels[5]}
                      onCheckedChange={() => handleChannelChange(5)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <canvas
        id="smoothie-chart"
        style={{ width: "80%", height: "50%" }}
        width="1075"
        height={200 + (height - 1) * 40}
      />
    </div>
  );
};

export default CanvasTry;
