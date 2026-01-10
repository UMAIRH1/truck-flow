"use client";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

interface LineChartProps {
  data?: number[];
  labels?: string[];
  trend?: string;
  trendLabel?: string;
  className?: string;
  lineColor?: string;
}

export function LineChart({
  data = [30, 45, 35, 50, 40, 55, 45, 60, 50, 65],
  labels = ["Oct", "Nov", "Dec"],
  trend = "+5%",
  trendLabel = "Last 3 Months",
  className,
  lineColor = "#1e40af",
}: LineChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: trendLabel,
        data,
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
    <div>
      <div className="flex items-center justify-start gap-2 mb-4">
        <span className="text-base font-normal text-gray-600">{trendLabel}</span>
        <span className="text-base font-medium text-green-600">{trend}</span>
      </div>
      <div className="w-full h-40 md:h-56 lg:h-72">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
