"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function getAuditTrails(orgId: string, params: { page?: string, date?: string, action?: string, sort_by?: string, model_name?: string }) {
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

    query.set("paginate", "true");

    if (params.page) query.set("page", params.page);
    if (params.page) query.set("page", params.page);

    if (params.action && params.action !== "all") {
      query.set("action", params.action);
    }

    if (params.model_name && params.model_name !== "all") {
      query.set("model_name", params.model_name);
    }


    if (params.date) query.set("date", params.date);

    if (params.sort_by) query.set("sort_by", params.sort_by);

  

    // 📊 FETCH JOURNALS
    const auditTrailsRes = await fetch(
      `${backendURL}/${orgId}/audit-trails/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await auditTrailsRes.json();

    if (!auditTrailsRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   journals: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      auditTrails: resultsData?? [],
      
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching audit-trails:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}