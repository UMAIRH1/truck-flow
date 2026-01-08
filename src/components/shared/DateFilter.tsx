"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = value ? value.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "Filter by date";

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl">
          <input type="text" placeholder="Filter by date" value={value ? formattedDate : ""} readOnly className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-lg border z-50">
          <input
            type="date"
            className="w-full p-2 border rounded-lg"
            onChange={(e) => {
              onChange(e.target.value ? new Date(e.target.value) : undefined);
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
