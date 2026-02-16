import { Load, ChartDataPoint } from "@/types";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function aggregateMonthlyMetrics(loads: Load[], metric: "income" | "expense" | "profit" = "income", months = 3, baseDate?: Date): ChartDataPoint[] {
  const now = baseDate ? new Date(baseDate) : new Date();
  const monthsArr: Date[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsArr.push(d);
  }

  return monthsArr.map((m) => {
    const from = startOfMonth(m).getTime();
    const to = endOfMonth(m).getTime();
    const value = loads.reduce((sum, load) => {
      const t = new Date(load.loadingDate).getTime();
      if (t < from || t > to) return sum;
      const income = load.clientPrice || 0;
      const expense = (load.driverPrice || 0);
      const v = metric === "income" ? income : metric === "expense" ? expense : income - expense;
      return sum + v;
    }, 0);

    const monthLabel = m.toLocaleString("en-US", { month: "short" });
    return { month: monthLabel, value };
  });
}

export function computeTrend(points: ChartDataPoint[]) {
  if (!points || points.length < 2) return "0%";
  const n = points.length;
  const last = points[n - 1].value;
  const prev = points[n - 2].value || 1;
  if (prev === 0) return last === 0 ? "0%" : "+100%";
  const diff = ((last - prev) / Math.abs(prev)) * 100;
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}${Math.abs(Math.round(diff))}%`;
}

export interface QuarterData {
  quarter: string;
  value: number;
}

export function aggregateQuarterlyMetrics(loads: Load[], metric: "income" | "expense" | "profit" = "income", year?: number): QuarterData[] {
  const y = year || new Date().getFullYear();
  const quarters: QuarterData[] = [
    { quarter: "Q1", value: 0 },
    { quarter: "Q2", value: 0 },
    { quarter: "Q3", value: 0 },
    { quarter: "Q4", value: 0 },
  ];

  for (const load of loads) {
    const d = new Date(load.loadingDate);
    if (d.getFullYear() !== y) continue;
    const q = Math.floor(d.getMonth() / 3);
    const income = load.clientPrice || 0;
    const expense = (load.driverPrice || 0);
    const v = metric === "income" ? income : metric === "expense" ? expense : income - expense;
    quarters[q].value += v;
  }

  return quarters;
}

export function computeQuarterTrend(quarters: QuarterData[]) {
  if (!quarters || quarters.length < 2) return "0%";
  let lastIndex = quarters.length - 1;
  let prevIndex = lastIndex - 1;
  const last = quarters[lastIndex].value;
  const prev = quarters[prevIndex].value || 1;
  if (prev === 0) return last === 0 ? "0%" : "+100%";
  const diff = ((last - prev) / Math.abs(prev)) * 100;
  const sign = diff >= 0 ? "+" : "-";
  return `${sign}${Math.abs(Math.round(diff))}%`;
}

export function aggregateLastFourQuarters(loads: Load[], metric: "income" | "expense" | "profit" = "income", baseDate?: Date): QuarterData[] {
  const now = baseDate ? new Date(baseDate) : new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const quarters: QuarterData[] = [];
  for (let i = 3; i >= 0; i--) {
    const qIndex = currentQuarter - i;
    const yearOffset = Math.floor(qIndex / 4);
    const qInYear = ((qIndex % 4) + 4) % 4;
    const year = now.getFullYear() + yearOffset;
    const startMonth = qInYear * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0);
    const value = loads.reduce((sum, load) => {
      const t = new Date(load.loadingDate).getTime();
      if (t < start.getTime() || t > end.getTime()) return sum;
      const income = load.clientPrice || 0;
      const expense = (load.driverPrice || 0);
      const v = metric === "income" ? income : metric === "expense" ? expense : income - expense;
      return sum + v;
    }, 0);
    quarters.push({ quarter: `Q${qInYear + 1}`, value });
  }

  return quarters;
}
