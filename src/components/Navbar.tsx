"use client";

import React from "react";
import Link from "next/link";
import { ModeToggle } from "./Theming/mode-toggle";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <div>
      <div className="sticky top-0 left-5 right-5 md:left-0 md:right-0 flex backdrop-blur-sm justify-center py-[10px] border-b items-center font-bold z-50">
        <div className="flex w-full max-w-6xl justify-between items-center">
          <a
            className="text-primary font-medium text-xl underline underline-offset-8"
            href="/"
          >
            BioSignal Recorder
          </a>

          <div className="flex gap-2 items-center">
            <ModeToggle />
            <Link href="https://github.com/upsidedownlabs" target="__blank">
              <Button variant={"ghost"} size={"sm"}>
                <GitHubLogoIcon width={20} height={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
