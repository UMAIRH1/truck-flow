import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LucideIcon } from "lucide-react";

interface SelectWithIconProps extends React.ComponentProps<typeof Select> {
  icon: LucideIcon;
  iconClassName?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export const SelectWithIcon = React.forwardRef<HTMLButtonElement, SelectWithIconProps>(({ icon: Icon, placeholder, options, children, ...props }, ref) => {
  return (
    <div className="relative">
      <Icon className={`absolute left-3 top-1/2 text-[#0095FF] -translate-y-1/2 h-4 w-4 z-10 `} />
      <Select {...props}>
        <SelectTrigger ref={ref} className="pl-9 rounded-sm! border border-[#CECECE]! h-12!">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {options.map((option) => (
            <SelectItem className="w-full" key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

SelectWithIcon.displayName = "SelectWithIcon";
