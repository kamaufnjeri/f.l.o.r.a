"use client";

import { RequestResult } from "@/types";
import { useTransition, useState } from "react";
import toast from "react-hot-toast";
import Button from "./Button";
import { useRouter } from "next/navigation";

type Props = {
  action: (formData: FormData) => Promise<RequestResult>;
  children: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  buttonLabel?: string;
  buttonLoadingLabel?: string;
};

export default function FormWrapper({
  action,
  children,
  className = "",
  onSuccess,
  buttonLabel = "Submit",
  buttonLoadingLabel = "Please wait...",
}: Props) {

  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await action(formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong.");
          return;
        }

        toast.success(res.message || "Success");

        if (res.redirectTo) {
          router.push(res.redirectTo);
        }
        onSuccess?.();

        // Reliable form reset for Server Actions
        setResetKey((prev) => prev + 1);

      } catch (error) {
        console.error(error);

        toast.error(
          "Something went wrong. Please try again."
        );
      }
    });
  }

  return (
    <form
      key={resetKey}
      action={handleSubmit}
      className={[
        "w-full space-y-6",
        "rounded-3xl",
        "border border-zinc-200/60",
        "bg-white/90 backdrop-blur-sm",
        "p-6 sm:p-8",
        "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      {/* Fields */}
      <div className="space-y-5">
        {children}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        aria-busy={pending}
        className={[
          "relative w-full overflow-hidden",
          "rounded-xl py-3 font-semibold",
          "transition-all duration-300",
          pending
            ? "cursor-not-allowed opacity-80"
            : "hover:-translate-y-0.5",
        ].join(" ")}
      >
        <span className="flex items-center justify-center gap-2">
          
          {pending && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-90"
                fill="currentColor"
                d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
              />
            </svg>
          )}

          <span>
            {pending
              ? buttonLoadingLabel
              : buttonLabel}
          </span>
        </span>
      </Button>
    </form>
  );
}