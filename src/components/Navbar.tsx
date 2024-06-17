"use client";

import React from "react";
import Link from "next/link";
import { ModeToggle } from "./Theming/mode-toggle";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CircleAlert } from "lucide-react";

const Navbar = () => {
  return (
    <div>
      <div className="sticky top-0 left-5 right-5 md:left-0 md:right-0 flex backdrop-blur-sm justify-center py-[10px] border-b items-center font-bold z-50">
        <div className="flex w-full max-w-screen mx-16 justify-between items-center">
          <a className="text-primary font-medium text-xl" href="/">
            BioSignal Recorder
          </a>

          <div className="flex gap-2 items-center">
            <ModeToggle />
            <Link href="https://github.com/upsidedownlabs" target="__blank">
              <Button variant={"ghost"} size={"sm"}>
                <GitHubLogoIcon width={24} height={24} />
              </Button>
            </Link>
            <Dialog>
              <DialogTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3">
                        <CircleAlert />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Contibutors</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <Card className="border-none -m-5">
                  <CardHeader>
                    <CardTitle className="text-lg">Contributors</CardTitle>
                    <Separator className="bg-primary" />
                  </CardHeader>
                  <CardContent className="flex justify-center items-center gap-5">
                    <Link href={"https://github.com/Asc91"}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                              <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/55803500?v=4" />
                                <AvatarFallback>Mahesh</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mahesh Tupe</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                    <Link href={"https://github.com/AleksaZCodes"}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                              <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/103934960?v=4" />
                                <AvatarFallback>Ritika</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ritika Mishra</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                    <Link href={"https://github.com/akadeepesh"}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                              <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/108585048?v=4" />
                                <AvatarFallback>Aleksa</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Aleksa Zdravković</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                    <Link href={"https://github.com/akadeepesh"}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                              <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/100466756?v=4" />
                                <AvatarFallback>Deepesh</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Deepesh Kumar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                    <Link
                      href={"https://github.com/lorforlinux"}
                      target="__blank"
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant={"ghost"} size={"sm"}>
                              <Avatar>
                                <AvatarImage src="https://avatars.githubusercontent.com/u/20015794?v=4" />
                                <AvatarFallback>Deepak Khatri</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Deepak Khatri</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Link>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
