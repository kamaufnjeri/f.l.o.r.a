import { Entry } from "@/components/dashboard/purchases/PurchaseSalesAccountField";
import { AnyObject, JournalEntry, JournalType, PurchaseEntry, SaleEntry, ServiceIncomeEntry } from "@/types";
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

export const normalizeWord =  (string: string): string => {
  if (typeof string !== "string") return "";
  return capitalizeFirstLetter(replaceDash(string));
}

type ApiErrorShape = {
  message?: unknown;
  error?: unknown;
  details?: unknown;
  data?: unknown;
  response?: {
    data?: unknown;
  };
};

export function formatApiError(error: unknown): string {
  let errorMessage = "An error occurred";

  const err = error as ApiErrorShape;
  const responseData: unknown = err?.response?.data;
  const responseErrorData =
    typeof responseData === "object" && responseData !== null
      ? (responseData as Record<string, unknown>).details ??
        (responseData as Record<string, unknown>).error
      : undefined;
  const errorData =
    responseErrorData ??
    err?.details ??
    err?.error ??
    err?.data ??
    err?.message ??
    responseData;

  // ==============================
  // 1. ARRAY ERRORS
  // ==============================
  if (Array.isArray(errorData)) {
    errorMessage = errorData.join("\n");
  }

  // ==============================
  // 2. OBJECT ERRORS (DRF validation)
  // ==============================
  else if (
    typeof errorData === "object" &&
    errorData !== null &&
    !Array.isArray(errorData)
  ) {
    const errorList: string[] = [];

    Object.entries(errorData as Record<string, unknown>).forEach(
      ([key, value]) => {
        errorList.push(`${key}: ${String(value)}`);
      }
    );

    errorMessage = errorList.join("\n");
  }

  // ==============================
  // 3. STRING ERRORS
  // ==============================
  else if (typeof errorData === "string") {
    errorMessage = errorData;
  }

  // ==============================
  // 4. FALLBACK
  // ==============================
  else if (errorData) {
    errorMessage = String(errorData);
  }

  return errorMessage;
}
export const buildQuery = (
  params: Record<string, string | number | boolean | undefined | null>,
  paginate: boolean
): string => {
  const query = new URLSearchParams();

  query.set("paginate", String(paginate));

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

export const saveFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export function findEntriesByType(
  entries: JournalEntry[],
  type: JournalType
) {
  return entries
    .map((entry, index) => ({
      entry,
      index,
    }))
    .filter((item) => item.entry.type === type);
}

export const computePurchaseTotal = (entries: PurchaseEntry[]) => {
  return entries.reduce((amount, entry) => {
    const qty = Number(entry.purchased_quantity || 0);
    const price = Number(entry.purchase_price || 0);
    return amount + qty * price;
  }, 0);
};

export const computeSaleTotal = (entries: SaleEntry[]) => {
  return entries.reduce((amount, entry) => {
    const qty = Number(entry.sold_quantity || 0);
    const price = Number(entry.sales_price || 0);
    return amount + qty * price;
  }, 0);
};

export const computeServiceIncomeTotal = (entries: ServiceIncomeEntry[]) => {
  return entries.reduce((amount, entry) => {
    const qty = Number(entry.quantity || 0);
    const price = Number(entry.price || 0);
    return amount + qty * price;
  }, 0);
};

export function groupEntries(entries: JournalEntry[]) {
  return entries.reduce(
    (acc, entry, index) => {
      const item = { entry, index };

      if (entry.type === "payment") {
        acc.payment.push(item);
      } else {
        acc[entry.type] = item;
      }

      return acc;
    },
    {
      payment: [] as Entry[],
    } as Record<
      string,
      Entry
    > & {
      payment: Entry[];
    }
  );
}