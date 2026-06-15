"use client";

export type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  name: string;
};

export default function SelectFilter({
  value,
  onChange,
  options,
  placeholder = "Select",
  name,
}: Props) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        className="
          h-10
          w-full
          appearance-none
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          text-sm
          font-medium
          shadow-sm
          transition
          focus:outline-none
          focus:ring-2
          focus:ring-black/10
          focus:border-black
          cursor-pointer
        "
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* dropdown icon */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        ▾
      </div>
    </div>
  );
}