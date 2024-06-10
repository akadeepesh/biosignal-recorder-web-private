"use client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

import React from "react";

const page = () => {
  return (
    <div className="h-screen">
      <Navbar />
      <div className="flex h-[80%] justify-center items-center">
        <div className="">
          <Button className="bg-primary">Connect</Button>
        </div>
      </div>
    </div>
  );
};

export default page;
