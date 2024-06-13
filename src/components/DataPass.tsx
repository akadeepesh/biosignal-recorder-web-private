"use client";
import Connection from "@/components/Connection";
import Canvas from "@/components/Canvas";
import { useState } from "react";

const DataPass = () => {
  const [data, setData] = useState("");
  return (
    <>
      <Canvas data={data} />
      <Connection LineData={setData} />
    </>
  );
};

export default DataPass;
