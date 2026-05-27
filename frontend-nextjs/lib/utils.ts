import { AnyObject, ApiErrorShape } from "@/types";
import type { RefObject } from "react";


/* =========================
   HELPERS
========================= */

export const getNumber = (pageNo: number, currentIndex: number): number => {
  return (pageNo - 1) * 10 + currentIndex + 1;
};

export const scrollBottom = (
  scrollRef: RefObject<HTMLElement | null>
): void => {
  if (scrollRef?.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
};

export const isObject = (item: unknown): item is AnyObject => {
  return !!item && typeof item === "object" && !Array.isArray(item);
};

export const capitalizeFirstLetter = (string: string): string => {
  if (typeof string !== "string") return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const replaceDash = (string: string): string => {
  if (typeof string !== "string") return "";

  const updatedString = string.replace(/_/g, " ");

  let newString: string | null = null;

  if (!string.includes("@")) {
    newString = string.split(".")[1];
  }

  if (!newString) return updatedString;

  return newString.replace(/_/g, " ");
};

export function formatApiError(error: unknown): string {
  let errorMessage = "An error occurred";

  const err = error as ApiErrorShape;

  const errorData =
    err?.response?.data?.details || err?.response?.data;

  // 1. Array errors
  if (Array.isArray(errorData)) {
    errorMessage = errorData.join("\n");
  }

  // 2. Object errors (Django validation style)
  else if (isObject(errorData)) {
    const errorList: string[] = [];

    Object.entries(errorData as Record<string, unknown>).forEach(
      ([key, value]) => {
        errorList.push(
          `${capitalizeFirstLetter(replaceDash(key))}: ${value}`
        );
      }
    );

    errorMessage = errorList.join("\n");
  }

  // 3. String or fallback
  else if (typeof errorData === "string") {
    errorMessage = errorData;
  }

  // 4. Axios / JS error.message fallback
  else if (err?.message) {
    errorMessage = err.message;
  }

  return replaceDash(errorMessage);
}