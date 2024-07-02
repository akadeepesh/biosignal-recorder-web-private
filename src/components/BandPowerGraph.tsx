import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";

interface BandPowerGraphProps {
  fftData: number[][];
  samplingRate: number;
}

const BandPowerGraph: React.FC<BandPowerGraphProps> = ({
  fftData,
  samplingRate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const bands = useMemo(
    () => [
      { name: "DELTA", range: [0.5, 4], color: "#FF6384" },
      { name: "THETA", range: [4, 8], color: "#FFD166" },
      { name: "ALPHA", range: [8, 13], color: "#06D6A0" },
      { name: "BETA", range: [13, 32], color: "#4F8EFD" },
      { name: "GAMMA", range: [32, 100], color: "#9966FF" },
    ],
    []
  );

  const calculateBandPower = useCallback(
    (channelData: number[]) => {
      const fftSize = channelData.length * 2;
      const freqResolution = samplingRate / fftSize;

      return bands.map((band) => {
        const startBin = Math.floor(band.range[0] / freqResolution);
        const endBin = Math.min(
          Math.floor(band.range[1] / freqResolution),
          channelData.length - 1
        );
        let power = 0;
        for (let i = startBin; i <= endBin; i++) {
          power += channelData[i] ** 2;
        }
        return power;
      });
    },
    [bands, samplingRate]
  );

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || fftData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const axisColor = theme === "dark" ? "white" : "black";
    const barWidth = (width - 100) / bands.length;
    const spacing = 10;

    const bandPowers = calculateBandPower(fftData[0]); // Using the first channel
    const minPower = Math.max(1e-9, Math.min(...bandPowers));
    const maxPower = Math.max(...bandPowers);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 10);
    ctx.lineTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.strokeStyle = axisColor;
    ctx.stroke();

    // Draw bars
    bandPowers.forEach((power, index) => {
      const x = 50 + index * (barWidth + spacing);
      const logPower = Math.log10(power);
      const logMinPower = Math.log10(minPower);
      const logMaxPower = Math.log10(maxPower);
      const barHeight =
        ((logPower - logMinPower) / (logMaxPower - logMinPower)) *
        (height - 60);
      ctx.fillStyle = bands[index].color;
      ctx.fillRect(x, height - 50 - barHeight, barWidth, barHeight);
    });

    // Draw labels
    ctx.fillStyle = axisColor;
    ctx.font = "12px Arial";

    // Y-axis labels (logarithmic scale)
    for (
      let i = Math.floor(Math.log10(minPower));
      i <= Math.ceil(Math.log10(maxPower));
      i++
    ) {
      const value = Math.pow(10, i);
      const labelY =
        height -
        50 -
        ((Math.log10(value) - Math.log10(minPower)) /
          (Math.log10(maxPower) - Math.log10(minPower))) *
          (height - 60);
      ctx.fillText(value.toExponential(0), 5, labelY);
    }

    // X-axis labels
    bands.forEach((band, index) => {
      const labelX = 50 + index * (barWidth + spacing) + barWidth / 2;
      ctx.fillText(band.name, labelX, height - 30);
    });

    ctx.font = "14px Arial";
    ctx.fillText("EEG Power Bands", width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Power - (uV)^2 / Hz", 0, 0);
    ctx.restore();
  }, [bands, fftData, theme, calculateBandPower]);

  useEffect(() => {
    drawGraph();
  }, [fftData, theme, drawGraph]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      drawGraph();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [drawGraph]);

  return (
    <div ref={containerRef} className="w-full h-[400px] max-w-[700px]">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default BandPowerGraph;
