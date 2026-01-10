"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, TableOfContents } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function DateField({ value, onChange, placeholder = "Today", className }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value || new Date());
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatted = value ? value.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : placeholder;

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const startWeekDay = monthStart.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekDay; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));

  const gotoPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const gotoNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleSelect = (d: Date) => {
    onChange(d);
    setOpen(false);
  };

  const weekdayShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div className="flex w-full gap-2  items-center justify-between">
        <div className="flex w-full items-center text-(--color-blue-dark) justify-center rounded-sm border border-gray-200 px-4 py-3 gap-3 text-sm">
          <TableOfContents className="h-5 w-5" />
          <div className="min-w-[80px]">{formatted}</div>
        </div>
        <button onClick={() => setOpen((s) => !s)} className="p-3 bg-black text-white rounded-sm">
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl shadow-lg border z-50 w-[320px]">
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
                    isSelected ? "bg-yellow-400 text-black font-medium" : "hover:bg-gray-100",
                    isToday && !isSelected ? "border border-gray-200" : ""
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
                setOpen(false);
              }}
              className="text-sm text-gray-600 hover:underline"
            >
              Clear
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                onChange(new Date());
                setOpen(false);
              }}
              className="text-sm text-yellow-500 hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
