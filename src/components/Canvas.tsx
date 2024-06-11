"use client";
import { Settings } from "lucide-react";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Canvas = () => {
  const [speed, setSpeed] = useState("two");
  const [height, setHeight] = useState(5);
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
            <div className="flex flex-col gap-5">
              <div className="flex flex-row gap-20 mt-5">
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
              <div className="flex flex-row gap-16">
                <div className="">Height</div>
                <Slider
                  defaultValue={[5]}
                  value={[height]}
                  onValueChange={([value]) => setHeight(value)}
                  max={10}
                  step={1}
                />
                <div className="flex">{height}</div>
              </div>
              <div className="flex flex-row gap-14">
                <div className="">Channels</div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-5">
                    <Label>CH-1</Label>
                    <Checkbox checked={true} />
                    <Label>CH-2</Label>
                    <Checkbox />
                    <Label>CH-3</Label>
                    <Checkbox />
                  </div>
                  <div className="flex flex-row justify-evenly">
                    <Label>CH-4</Label>
                    <Checkbox />
                    <Label>CH-5</Label>
                    <Checkbox />
                    <Label>CH-6</Label>
                    <Checkbox />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <canvas className="border-2 w-[70%] h-[50%]"></canvas>
    </div>
  );
};

export default Canvas;
