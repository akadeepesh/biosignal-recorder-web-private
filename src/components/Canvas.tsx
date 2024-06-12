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

// import { useTheme } from "next-themes";

const Canvas = () => {
  // const { theme, setTheme } = useTheme();
  // const [chartBack, setChartBack] = useState("rgba(2, 8, 23)");
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

  // let millisperpixel = 4;
  // useEffect(() => {
  //   if (speed === "one") {
  //     millisperpixel = 2;
  //   } else if (speed === "two") {
  //     millisperpixel = 4;
  //   } else {
  //     millisperpixel = 8;
  //   }
  // }, [speed]);

  // useEffect(() => {
  //   if (theme === "light") {
  //     setChartBack("rgba(255, 255, 1)");
  //   }
  // }, [theme]);

  const seriesRef = useRef(new TimeSeries());
  const chartRef = useRef(
    new SmoothieChart({
      millisPerPixel: 20,
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
    })
  );

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;

    // TimeSeries options
    chart.addTimeSeries(series, {
      strokeStyle: "rgba(0, 255, 0, 0.8)",
      lineWidth: 1,
    });

    const canvas = document.getElementById(
      "smoothie-chart"
    ) as HTMLCanvasElement;
    if (canvas !== null) {
      chart.streamTo(canvas, 500);
    }

    // data generation
    const interval = setInterval(() => {
      const randomValue = Math.random() * 10000;
      series.append(Date.now(), randomValue);
    }, 500);

    return () => {
      clearInterval(interval);
      chart.stop();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomValue = Math.random() * 10000;
      seriesRef.current.append(Date.now(), randomValue);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
      {/* <div className="flex flex-col items-center mt-4">
        <div className="">
          Speed: <span id="speed-value"></span>
        </div>
        <div className="">
          Height: <span id="height-value"></span>
        </div>
        <div className="">
          Channels: <span id="channels-value"></span>
        </div>
      </div> */}
      <canvas
        id="smoothie-chart"
        width="1075"
        height={200 + (height - 1) * 40}
      />
    </div>
  );
};

export default Canvas;
