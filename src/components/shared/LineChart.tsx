"use client";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

interface DataPoint {
  month: string;
  value: number;
}

interface LineChartProps {
  data?: number[] | DataPoint[];
  labels?: string[];
  trend?: string;
  trendLabel?: string;
  className?: string;
  lineColor?: string;
}

export function LineChart({ data = [30, 45, 35], labels, trend = "+5%", trendLabel = "Last 3 Months", className, lineColor = "#1e40af" }: LineChartProps) {
  // helper to capitalize month labels
  const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  let chartLabels: string[] = [];
  let chartValues: number[] = [];

  if (Array.isArray(data) && data.length > 0 && typeof (data as any)[0] === "object") {
    const points = data as DataPoint[];
    chartLabels = points.map((p) => capitalize(p.month));
    chartValues = points.map((p) => p.value);
  } else {
    chartValues = data as number[];
    const defaultLabels = ["Oct", "Nov", "Dec"];
    if (labels && labels.length >= chartValues.length) {
      chartLabels = labels.slice(0, chartValues.length);
    } else if (labels && labels.length < chartValues.length) {
      chartLabels = [...labels, ...Array.from({ length: chartValues.length - labels.length }, (_, i) => `M${labels.length + i + 1}`)];
    } else {
      chartLabels = defaultLabels.slice(0, Math.max(1, chartValues.length));
    }
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: trendLabel,
        data: chartValues,
        fill: true,
        backgroundColor: `${lineColor}33`,
        borderColor: lineColor,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  } as any;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9CA3AF", font: { size: 12 } },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
    elements: {
      line: { borderCapStyle: "round" },
    },
  } as any;

  return (
    <div className={className}>
      <div className="flex items-center justify-start gap-2 mb-4">
        <span className="text-base font-normal text-gray-600">{trendLabel}</span>
        <span className="text-base font-medium text-green-600">{trend}</span>
      </div>
      <div className="w-full h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
