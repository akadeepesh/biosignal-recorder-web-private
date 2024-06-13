"use client";
import MainPage from "@/components/MainPage";
import Canvas from "@/components/Canvas";
import { useState } from "react";

const DataPass = () => {
  const [data, setData] = useState("");
  return (
    <>
      <Canvas data={data} />
      <MainPage LineData={setData} />
    </>
  );
};

export default DataPass;
