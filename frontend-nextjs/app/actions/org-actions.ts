'use server'

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function createOrganization(formData: FormData) {
  try {
    const cookieStore = await cookies();

    const payload = {
      org_name: formData.get("org_name"),
      org_email: formData.get("org_email"),
      country: formData.get("country"),
      currency: formData.get("currency"),
      org_phone_number: formData.get("org_phone_number"),
    };

    const res = await fetch(`${backendURL}/organisations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(), // 👈 IMPORTANT (auth)
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

    const data = await res.json();

    return {
      success: true,
      message: data?.message || "Organization created",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function sendInvites(formData: FormData, orgId?:  string | null) {
  try {
    if (!orgId) {
      return { success: false, error: "Missing organisation Id" };
    }
    const cookieStore = await cookies();

    // 👇 emails come as JSON string from hidden input
    const emailsRaw = formData.get("emails") as string;

    const emails = emailsRaw ? JSON.parse(emailsRaw) : [];

    const res = await fetch(`${backendURL}/organisations/${orgId}/send-invite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(emails),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      return {
        success: false,
        error: formatApiError(errorData),
      };
    }

    const data = await res.json();

    return {
      success: true,
      message: data?.message || "Invitations sent successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}