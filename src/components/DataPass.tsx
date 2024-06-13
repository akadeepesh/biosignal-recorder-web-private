"use client";
import Connection from "@/components/Connection";
import { useState } from "react";
import dynamic from "next/dynamic";

const ComponentCanva = dynamic(() => import("@/components/Canvas"), {
  ssr: false,
});

const DataPass = () => {
  const [data, setData] = useState("");
  return (
    <>
      <ComponentCanva data={data} />
      <Connection LineData={setData} />
    </>
  );
};

export default DataPass;
