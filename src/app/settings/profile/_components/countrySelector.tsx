"use client";
import React, { useMemo } from "react";
import Select, { SingleValue } from "react-select";
import countryList from "react-select-country-list";

type Props = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
};

type Option = { label: string; value: string };

export default function CountrySelector({ value, onChange, className = "", placeholder = "Select Country" }: Props) {
  const options = useMemo<Option[]>(() => countryList().getData() as Option[], []);

  const selected = options.find((o: Option) => o.value === value) || null;

  return (
    <Select
      options={options}
      value={selected}
      onChange={(option: SingleValue<{ label: string; value: string }>) => onChange(option?.value || "")}
      classNamePrefix="rc"
      placeholder={placeholder}
      menuPlacement="bottom"
      menuPosition="fixed"
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      isSearchable
      styles={{
        control: (base) => ({
          ...base,
          minHeight: "48px",
          borderColor: "#e5e7eb",
          paddingLeft: "6px",
          paddingRight: "6px",
          boxShadow: "none",
        }),
        input: (base) => ({ ...base, margin: 0, padding: 0 }),
        indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
        menu: (base) => ({ ...base, minHeight: "150px", maxHeight: "340px" }),
        menuList: (base) => ({ ...base, minHeight: "150px", maxHeight: "200px", overflowY: "auto" }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      className={`w-full ${className}`}
    />
  );
}
