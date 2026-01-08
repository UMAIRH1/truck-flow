"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeTab, onTabChange, className }: FilterTabsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1 text-xs">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
