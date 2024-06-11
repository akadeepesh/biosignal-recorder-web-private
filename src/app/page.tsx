import React from "react";
import Navbar from "@/components/Navbar";
import MainPage from "@/components/MainPage";
import Canvas from "@/components/Canvas";

const Page = () => {
  return (
    <div className="h-screen">
      <Navbar />
      <Canvas />
      <MainPage />
    </div>
  );
};

export default Page;
