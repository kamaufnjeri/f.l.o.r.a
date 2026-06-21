"use client";

import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  children,
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = true,
  className,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={clsx(
        // Base
        "relative inline-flex cursor-pointer items-center justify-center gap-2",
        "rounded-xl font-medium",
        "transition-all duration-200",
        "outline-none",
        // Sizing
        "px-5 py-3 text-sm sm:text-base",

        // Width
        fullWidth && "w-full",

        // Colors
        "bg-primary text-white",

        // Effects
        "shadow-md shadow-primary/20",
        "hover:shadow-lg hover:shadow-primary/30",
        "hover:-translate-y-0.5",
        "active:translate-y-0 active:scale-[0.98]",

        // Focus
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        "focus-visible:ring-offset-2",

        // Disabled
        "disabled:pointer-events-none",
        "disabled:opacity-70",
        "disabled:hover:translate-y-0",

        className
      )}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-20"
          />

          <path
            fill="currentColor"
            className="opacity-90"
            d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
          />
        </svg>
      )}

      <span>{children}</span>
    </button>
  );
}