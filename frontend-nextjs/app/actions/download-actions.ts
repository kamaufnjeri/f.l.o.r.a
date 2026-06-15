"use server";

import { buildQuery, formatApiError } from "@/lib/utils";
import { cookies } from "next/headers";

const backendURL = process.env.BACKEND_URL;

type DownloadPDFResponse =
  | { success: true; message: string, blob: Blob }
  | { success: false; error: string };

export async function downloadListPdf(
  orgId: string,
  params: Record<string, string | number | boolean | undefined | null>,
  title: string,
  downloadType: string,
): Promise<DownloadPDFResponse> {
  try {
    if (!orgId && !downloadType) {
      return {
        success: false,
        error: "Organization ID and download type is required",
      };
    }

    const cookieStore = await cookies();

    const query = buildQuery(params, false);

    const res = await fetch(
      `${backendURL}/${orgId}/${downloadType}/download/?${query}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify({ title }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      return {
        success: false,
        error: formatApiError(errorData),
      };
    }
    const blob = await res.blob(); // ✅ fetch-native way
    // We don't process blob here in server action
    // just confirm success
    return {
      success: true,
      blob, // ✅ fetch-native way
      message: "PDF generated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}