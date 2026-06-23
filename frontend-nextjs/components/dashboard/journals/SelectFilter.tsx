"use client";

import { OptionType } from "@/constants";


type Props = {
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  name?: string;
  
};

export default function SelectFilter({
  value,
  onChange,
 
  options,
  placeholder = "Select",
  name = "",
}: Props) {
  return (
   <div className="w-full space-y-1 relative">
   

      {/* INPUT */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        className="
          w-full px-3 py-2 h-10 rounded-lg border border-gray-200
            text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-black/10
            transition
        "
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>

      
    </div>
  );
}