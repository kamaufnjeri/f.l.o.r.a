'use server'

import { formatApiError } from "@/lib/utils";
import { ReturnFormData } from "@/types/returns";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
const backendURL = process.env.BACKEND_URL;


export async function recordReturn(orgId: string, revalidateUrl: string, type: 'sales' | 'purchases', payload: ReturnFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    console.log('***/n', payload)

    const res = await fetch(`${backendURL}/${orgId}/${type}/returns/`, {
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
    revalidatePath(`/dashboard/${orgId}/${revalidateUrl}`)
    return {
      success: true,
      message: data.message || "Return created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function editReturn(
  orgId: string,
  returnId: string,
  payload: ReturnFormData,
  type: 'sales' | 'purchases',
  revalidateUrl: string,
) {
  try {
    if (!orgId || !returnId) {
      return {
        success: false,
        error: "Organization/Return ID is required",
      };
    }
    const cookieStore = await cookies();
    console.log('payload', payload)


    const res = await fetch(
      `${backendURL}/${orgId}/${type}/returns/${returnId}/`,
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
    revalidatePath(`/dashboard/${orgId}/${revalidateUrl}`)

    return {
      success: true,
      message: data.message || "Return entry updated successfully",
      return: data?.return,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing return:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getPurchaseReturns(orgId: string, params: { search?: string; date?: string; sort_by?: string; page?: string }) {
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

    if (params.search) query.set("search", params.search);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);
    // 📊 FETCH JOURNALS
    const purchaseReturnRes = await fetch(
      `${backendURL}/${orgId}/purchases/returns/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await purchaseReturnRes.json();

    if (!purchaseReturnRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   purchaseReturns: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      purchaseReturns: resultsData.purchase_returns ?? [],
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
    console.log("Error fetching purchase returns:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getSalesReturns(orgId: string, params: { search?: string; date?: string; sort_by?: string; page?: string }) {
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

    if (params.search) query.set("search", params.search);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);
    // 📊 FETCH JOURNALS
    const salesReturnRes = await fetch(
      `${backendURL}/${orgId}/sales/returns/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await salesReturnRes.json();

    if (!salesReturnRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   salesReturns: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      salesReturns: resultsData.sales_returns ?? [],
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
    console.log("Error fetching sales returns:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getSalesPurchaseReturns(orgId: string, salesPurchaseId: string, type: 'purchases' | 'sales', params: { page: string }) {
  try {
    if (!orgId || !salesPurchaseId) {
      return {
        success: false,
        error: "Organization/Sales/Purchase ID is required",
      };
    }
    const cookieStore = await cookies();

    // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    query.set("paginate", "true");
    if (params.page) query.set("page", params.page);
    // 📊 FETCH JOURNALS
    const returnRes = await fetch(
      `${backendURL}/${orgId}/${type}/${salesPurchaseId}/returns/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await returnRes.json();


    if (!returnRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   returns: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }
    const returns = resultsData.purchase_returns ?? resultsData.sales_returns;

    return {
      success: true,
      title: resultsData.title ?? "",
      returns: returns ?? [],
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
    console.log("Error fetching returns:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteReturn(
  orgId: string,
  returnId: string,
  type: "purchases" | "sales",
  revalidateUrl: string
) {
  try {
    if (!orgId || !returnId) {
      return {
        success: false,
        error: "Organization/Return ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/${type}/returns/${returnId}/`,
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
    revalidatePath(`/dashboard/${orgId}/${revalidateUrl}`)

    return {
      message: data.message || "Return entry deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting return:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}