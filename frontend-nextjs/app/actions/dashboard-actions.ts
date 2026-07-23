"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function getDashboard(orgId: string, params: { date?: string }) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();


    if (params.date) query.set("date", params.date);

  
    // 📊 FETCH JOURNALS
    const dashboardRes = await fetch(
      `${backendURL}/${orgId}/dashboard/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await dashboardRes.json();

    if (!dashboardRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }


    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   accounts: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      dashboard: data ?? [],
    };
  } catch (error) {

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}
