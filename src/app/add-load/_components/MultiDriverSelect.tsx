import React, { useState, useRef, useEffect } from "react";
import { BusFront, Check, ChevronDown, X } from "lucide-react";

interface MultiDriverSelectProps {
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiDriverSelect: React.FC<MultiDriverSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select drivers...",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = options.length > 0 && selectedValues.length === options.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map((o) => o.value));
    }
  };

  const toggleDriver = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const removeDriver = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedValues.filter((v) => v !== value));
  };

  const selectedLabels = selectedValues
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean);

  return (
    <div ref={containerRef} className="relative">
      <BusFront className="absolute left-3 top-1/2 text-[#0095FF] -translate-y-1/2 h-4 w-4 z-10" />

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-9 pr-10 h-12 rounded-sm border border-[#CECECE] bg-white text-left flex items-center
                   disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0095FF] transition-colors"
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-400 text-sm truncate">{placeholder}</span>
        ) : (
          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
            {selectedValues.length <= 2 ? (
              selectedLabels.map((label, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full max-w-[140px] truncate"
                >
                  {label}
                  <X
                    className="h-3 w-3 cursor-pointer shrink-0 hover:text-red-500"
                    onClick={(e) => removeDriver(selectedValues[i], e)}
                  />
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-700">
                {selectedValues.length} drivers selected
              </span>
            )}
          </div>
        )}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Select All */}
          <button
            type="button"
            onClick={toggleAll}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                allSelected
                  ? "bg-[#0095FF] border-[#0095FF]"
                  : "border-gray-300"
              }`}
            >
              {allSelected && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Select All Drivers
            </span>
          </button>

          {/* Driver options */}
          {options.map((option) => {
            const isChecked = selectedValues.includes(option.value);
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => toggleDriver(option.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    isChecked
                      ? "bg-[#0095FF] border-[#0095FF]"
                      : "border-gray-300"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-gray-700">{option.label}</span>
              </button>
            );
          })}

          {options.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              No drivers available
            </div>
          )}
        </div>
      )}
    </div>
  );
};
