"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { PurchaseFormData } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function recordPurchase(orgId: string, payload: PurchaseFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    

    const res = await fetch(`${backendURL}/${orgId}/purchases/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }
    return {
      success: true,
      message: data.message || "Purchase created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getJournals(orgId: string, params: { search?: string; date?: string; sort_by?: string; page?: string }) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
        journals: [],
        totals: null,
        pagination: null,
      };
    }
    const cookieStore = await cookies();

    // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    query.set("paginate", "true");

    if (params.search) query.set("search", params.search);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);

  

    // 📊 FETCH JOURNALS
    const journalRes = await fetch(
      `${backendURL}/${orgId}/journals/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (!journalRes.ok) {
      return {
        success: true,
        journals: [],
        pagination: null,
        totals: null,
      };
    }

    const data = await journalRes.json();
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
      journals: resultsData.journals ?? [],
      totals: resultsData.totals ?? {
        debit_total: 0,
        credit_total: 0,
      },
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching journals:", error);

    return {
      success: false,
      user: null,
      journals: [],
      totals: null,
      pagination: null,
    };
  }
}

export async function getPurchase(orgId: string, purchaseId: string) {
  try {
    if (!orgId || !purchaseId) {
      return {
        success: false,
        error: "Organization/Purchase ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/purchases/${purchaseId}/`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

  
    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }


    return {
      success: true,
      purchase: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching purchase:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editPurchase(
  orgId: string,
  purchaseId: string,
  payload: PurchaseFormData
) {
  try {
    if (!orgId || !purchaseId) {
      return {
        success: false,
        error: "Organization/Purchase ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/purchases/${purchaseId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(payload),
      }
    );

   
    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

      return {
        success: true,
        message: data.message || "Purchase updated successfully",
        purchase: data?.journal,
        select_options: data?.select_options
      };
  } catch (error) {
    console.log("Error editing purchase:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deletePurchase(
  orgId: string,
  purchaseId: string
) {
  try {
    if (!orgId || !purchaseId) {
      return {
        success: false,
        error: "Organization/Purchase ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/purchases/${purchaseId}/`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieStore.toString(),
        },
      }
    );

   
    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }
    return {
      message: data.message || "Purchase deleted successfully",
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting purchase:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}