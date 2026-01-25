"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DateFilterProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value || new Date());
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("common");

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const formattedDate = value ? value.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "";

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startWeekDay = monthStart.getDay(); // 0 (Sun) - 6 (Sat)

  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekDay; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));

  const gotoPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const gotoNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleSelect = (d: Date) => {
    onChange(d);
    setIsOpen(false);
  };

  const weekdayShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex items-center border border-(--color-primary-yellow-dark) rounded-lg gap-2">
        <div onClick={() => setIsOpen((s) => !s)} className="flex-1 flex items-center gap-2 px-4 py-3 cursor-pointer">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input type="text" placeholder={t("filterByDate")} value={formattedDate} readOnly className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => setIsOpen((s) => !s)} className="p-3 bg-(--color-primary-yellow-dark) rounded-r-lg hover:bg-gray-200 transition-colors">
          <Calendar className="h-5 w-5 text-white" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-(--color-primary-yellow-dark) z-50 w-[320px]">
          <div className="flex items-center justify-between mb-2">
            <button onClick={gotoPrev} className="p-2 rounded hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-medium">
              {viewDate.toLocaleString("default", { month: "long" })} {viewDate.getFullYear()}
            </div>
            <button onClick={gotoNext} className="p-2 rounded hover:bg-gray-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {weekdayShort.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              if (!d) return <div key={"empty-" + idx} className="h-8" />;
              const isSelected = value && d.toDateString() === value.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => handleSelect(d)}
                  className={cn(
                    "h-8 flex items-center justify-center rounded",
                    isSelected ? "bg-yellow-400 text-black font-normal" : "hover:bg-gray-100",
                    isToday && !isSelected ? " text-white bg-(--color-yellow-light)" : "",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className="text-sm text-gray-600 hover:underline"
            >
              {t("clear")}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
              className="text-sm text-yellow-500 hover:underline"
            >
              {t("today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
