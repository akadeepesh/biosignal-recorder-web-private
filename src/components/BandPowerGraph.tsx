import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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
  const [bandPowerData, setBandPowerData] = useState<number[]>(
    Array(5).fill(0)
  );
  const { theme } = useTheme();

  const bandColors = useMemo(
    () => ["red", "yellow", "green", "blue", "purple"],
    []
  );
  const bandNames = useMemo(
    () => ["DELTA", "THETA", "ALPHA", "BETA", "GAMMA"],
    []
  );
  const bandRanges = useMemo(
    () => [
      [0.5, 4],
      [4, 8],
      [8, 13],
      [13, 32],
      [32, 100],
    ],
    []
  );

  const calculateBandPower = useCallback(
    (fftChannelData: number[]) => {
      const freqResolution = samplingRate / (fftChannelData.length * 2);
      return bandRanges.map(([low, high], index) => {
        const startIndex = Math.max(1, Math.floor(low / freqResolution));
        const endIndex = Math.min(
          Math.ceil(high / freqResolution),
          fftChannelData.length
        );
        if (startIndex >= endIndex) return 0;
        const bandPower = fftChannelData
          .slice(startIndex, endIndex)
          .reduce((sum, val) => sum + val * val, 0);
        const powerDensity =
          (bandPower / (endIndex - startIndex)) * (1e6 / freqResolution);
        return powerDensity;
      });
    },
    [bandRanges, samplingRate]
  );
  useEffect(() => {
    if (fftData.length > 0 && fftData[0].length > 0) {
      const channelData = fftData[0]; // Use the first channel
      const newBandPowerData = calculateBandPower(channelData);
      setBandPowerData(newBandPowerData);
    }
  }, [fftData, calculateBandPower]);

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = (width - 100) / (bandNames.length + 1);
    const maxPower = Math.max(...bandPowerData);
    const minPower = Math.max(
      0.01,
      Math.min(...bandPowerData.filter((p) => p > 0))
    );

    const axisColor = theme === "dark" ? "white" : "black";

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(50, 10);
    ctx.lineTo(50, height - 50);
    ctx.lineTo(width - 20, height - 50);
    ctx.strokeStyle = axisColor;
    ctx.stroke();

    // Draw bars
    bandPowerData.forEach((power, index) => {
      const x = 50 + (index + 1) * barWidth;
      const logPower = Math.log10(Math.max(power, minPower));
      const logMinPower = Math.log10(minPower);
      const logMaxPower = Math.log10(maxPower);
      const barHeight =
        ((logPower - logMinPower) / (logMaxPower - logMinPower)) *
        (height - 60);
      ctx.fillStyle = bandColors[index];
      ctx.fillRect(x, height - 50 - barHeight, barWidth * 0.8, barHeight);
    });

    // Draw labels
    ctx.fillStyle = axisColor;
    ctx.font = "12px Arial";

    // Y-axis labels (log scale)
    const yLabels = [0.01, 0.1, 1, 10, 100];
    yLabels.forEach((value) => {
      if (value >= minPower && value <= maxPower) {
        const logValue = Math.log10(value);
        const labelY =
          height -
          50 -
          ((logValue - Math.log10(minPower)) /
            (Math.log10(maxPower) - Math.log10(minPower))) *
            (height - 60);
        ctx.fillText(value.toString(), 5, labelY);
      }
    });

    // X-axis labels
    bandNames.forEach((band, index) => {
      const labelX = 50 + (index + 1) * barWidth;
      ctx.fillText(band, labelX, height - 30);
    });

    ctx.font = "14px Arial";
    ctx.fillText("EEG Power Bands", width / 2, height - 10);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Power — μV² / Hz", -height / 2, 20);
    ctx.restore();
  }, [bandPowerData, theme, bandColors, bandNames]);

  useEffect(() => {
    drawGraph();
  }, [bandPowerData, theme, drawGraph]);

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
