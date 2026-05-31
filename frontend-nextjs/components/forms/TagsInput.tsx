"use client";

import { useState, KeyboardEvent, ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Props = {
  label?: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
};

export default function TagInput({
  label,
  name,
  value,
  onChange,
  max = 5,
  placeholder = "Add email...",
  required,
  icon,
}: Props) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const clean = tag.trim();

    if (!clean) return;
    if (value.includes(clean)) return;
    if (value.length >= max) return;
    if (!isValidEmail(clean)) return;

    onChange([...value, clean]);
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      addTag(input);
      setInput("");
    }

    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Label (same style as your Input) */}
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Wrapper */}
      <div className="relative">
        {/* icon */}
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}

        {/* chips + input */}
        <div
          className={`
            flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white
            focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary
            transition
            min-h-[48px]
            ${icon ? "pl-10 pr-3 py-2" : "px-3 py-2"}
          `}
        >
          {value.map((tag, i) => (
            <span
              key={i}
              className="
                flex items-center gap-2
                bg-primary/10 text-gray-700
                px-3 py-1 rounded-full text-sm
              "
            >
              {tag}

              <button
                type="button"
                onClick={() => removeTag(i)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              >
                <FaTimes size={12} />
              </button>
            </span>
          ))}

          {value.length < max && (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 min-w-[140px] outline-none text-sm bg-transparent"
            />
          )}
        </div>

        {/* 🔥 Hidden input for FormData compatibility */}
        <input
          type="hidden"
          name={name}
          value={JSON.stringify(value)}
        />
      </div>

      {/* helper */}
      <p className="text-xs text-gray-400">
        Press Enter or comma to add • Max {max}
      </p>
    </div>
  );
}