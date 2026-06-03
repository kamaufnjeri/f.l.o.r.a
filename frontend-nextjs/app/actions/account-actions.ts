"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function createAccount(orgId: string, formData: FormData) {
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
      belongs_to: formData.get("belongs_to"),
      opening_balance: formData.get("opening_balance"),
      opening_balance_type: formData.get("opening_balance_type"),
    };

    const res = await fetch(`${backendURL}/${orgId}/accounts/`, {
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

    const account = await res.json();

    return {
      success: true,
      message: "Account created successfully",
      account: account
        ? {
            name: account.name,
            id: account.id,
            sub_category: account.sub_category,
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