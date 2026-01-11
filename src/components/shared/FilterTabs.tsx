"use client";
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
    <div className={cn("flex gap-2 shadow-2xl mb-0 pb-2 border border-gray-100 p-0.5 rounded-sm overflow-x-auto  scrollbar-hide", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-3 py-2 rounded-sm cursor-pointer text-xs font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id ? "bg-(--color-primary-yellow-dark) text-black" : "bg-white text-(--color-extra-light-gray) hover:bg-gray-200"
          )}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1 text-xs">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
