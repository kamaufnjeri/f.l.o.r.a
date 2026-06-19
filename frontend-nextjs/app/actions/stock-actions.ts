"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function createStock(orgId: string, formData: FormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    const payload = {
        name: formData.get("name"),
        unit_name: formData.get("unit_name"),
        unit_alias: formData.get("unit_alias"),

        opening_stock_quantity: Number(formData.get("opening_stock_quantity")),
        opening_stock_rate: Number(formData.get("opening_stock_rate")),
    };

    const res = await fetch(`${backendURL}/${orgId}/stocks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      return {
        success: false,
        error: formatApiError(errorData),
      };
    }

    const stock = await res.json();

    return {
      success: true,
      message: "Stock created successfully",
      stock: stock
        ? {
            name: `${stock.name} (${stock.unit_alias})`,
            id: stock.id,
            }
        : null
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

