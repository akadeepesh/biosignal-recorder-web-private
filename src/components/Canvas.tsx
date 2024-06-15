"use client";
import { Settings, Pause, Play } from "lucide-react";
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

const Canvas = ({ data }: { data: string }) => {
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

  const [isPaused, setIsPaused] = useState(Array(channels.length).fill(false));

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

  const chartRef = useRef<SmoothieChart[]>([]);
  const seriesRef = useRef<(TimeSeries | null)[]>([]);
  const [isChartInitialized, setIsChartInitialized] = useState(false);

  useEffect(() => {
    if (!isChartInitialized) {
      channels.forEach((channel: any, index: number) => {
        if (channel) {
          const canvas = document.getElementById(
            `smoothie-chart-${index + 1}`
          ) as HTMLCanvasElement;

          const parentDiv = canvas.parentElement;
          if (parentDiv) {
            canvas.height = parentDiv.offsetHeight - 2;
            canvas.width = parentDiv.offsetWidth;
          }

          if (canvas) {
            const chart = new SmoothieChart({
              millisPerPixel: 10,
              interpolation: "bezier",
              grid: {
                borderVisible: true,
                millisPerLine: 250,
                lineWidth: 1,
                fillStyle: "rgba(2, 8, 23)",
              },
              tooltip: true,
              tooltipLine: { lineWidth: 1, strokeStyle: "#fffff" },
              title: {
                text: `Channel ${index + 1}`,
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

            if (chartRef.current && seriesRef.current) {
              chartRef.current[index] = chart;
              seriesRef.current[index] = series;
            }
          }
        }
      });

      setIsChartInitialized(true);
    }
  }, [isChartInitialized, channels]);

  const updateSpeed = () => {
    switch (speed) {
      case "one":
        chartRef.current.forEach((chart) => {
          chart.options.millisPerPixel = 8;
        });
        break;
      case "two":
        chartRef.current.forEach((chart) => {
          chart.options.millisPerPixel = 4;
        });
        break;
      case "three":
        chartRef.current.forEach((chart) => {
          chart.options.millisPerPixel = 2;
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isChartInitialized) {
      const lines = String(data).split("\n");
      for (const line of lines) {
        if (line.trim() !== "") {
          const sensorValues = line.split(",").map(Number).slice(2);
          channels.forEach((channel: any, index: number) => {
            if (channel) {
              const canvas = document.getElementById(
                `smoothie-chart-${index + 1}`
              );
              if (canvas) {
                const data = sensorValues[index];
                if (!isNaN(data)) {
                  const series = seriesRef.current[index];
                  series?.append(Date.now(), data);
                }
              }
            }
          });
        }
      }
    }
  }, [data, isChartInitialized, channels]);

  const handleSpeedChange = (newSpeed: string) => {
    setSpeed(newSpeed);
    updateSpeed();
  };

  const handlePauseClick = (index: number) => {
    setIsPaused((prevIsPaused) => {
      const updatedIsPaused = [...prevIsPaused];
      updatedIsPaused[index] = !prevIsPaused[index];

      if (updatedIsPaused[index]) {
        chartRef.current[index].stop();
      } else {
        chartRef.current[index]?.start();
      }
      return updatedIsPaused;
    });
  };

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
                  onValueChange={handleSpeedChange}
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
                  disabled
                  defaultValue={[5]}
                  value={[height]}
                  onValueChange={([value]) => setHeight(value)}
                  max={8}
                  step={1}
                  className="ml-16"
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
      {channels.map((channel: any, index: number) => {
        if (channel) {
          return (
            <div key={index} className="flex flex-row gap-4 max-w-7xl w-full">
              <div
                className="border border-secondary-foreground mb-4 w-full"
                style={{ height: `${40 + (height - 2) * 10}px` }}
              >
                <canvas id={`smoothie-chart-${index + 1}`} />
              </div>
              <div className="flex items-center mb-2">
                <Button
                  variant={"outline"}
                  className=" border-primary"
                  onClick={() => handlePauseClick(index)}
                  size={"sm"}
                >
                  {isPaused[index] ? <Play size={16} /> : <Pause size={16} />}
                </Button>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Canvas;
