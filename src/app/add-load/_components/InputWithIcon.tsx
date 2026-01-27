import React from "react";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface InputWithIconProps extends React.ComponentProps<typeof Input> {
  icon: LucideIcon;
  iconClassName?: string;
  showPlaceholderForDate?: boolean;
}

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, iconClassName = "text-[#0095FF]", className = "", showPlaceholderForDate = false, ...props }, ref) => {
    const isDateTimeInput = props.type === "date" || props.type === "time";
    const shouldShowCustomPlaceholder = isDateTimeInput && showPlaceholderForDate && !props.value;

    // merge provided style with our need to hide native date text when showing custom placeholder
    const mergedStyle = {
      ...(props.style || {}),
      ...(shouldShowCustomPlaceholder ? { color: "transparent" } : {}),
    } as React.CSSProperties;

    return (
      <div className="relative">
        <Icon className={`absolute left-3 ${iconClassName} top-1/2 -translate-y-1/2 h-4 w-4 z-10`} />
        <Input ref={ref} className={`pl-9 rounded-sm! border border-[#CECECE]! h-12! ${className}`} style={mergedStyle} {...props} />
        {shouldShowCustomPlaceholder && props.placeholder && <div className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm z-20">{props.placeholder}</div>}
      </div>
    );
  },
);

InputWithIcon.displayName = "InputWithIcon";
