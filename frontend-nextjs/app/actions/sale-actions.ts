"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { SaleFormData, SalesType } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function recordSale(orgId: string, payload: SaleFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    

    const res = await fetch(`${backendURL}/${orgId}/sales/`, {
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
      message: data.message || "Sales created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function getSales(orgId: string, params: { search?: string; sales: SalesType, date?: string; sort_by?: string; page?: string }) {
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
    if (params.sales) query.set("sales", params.sales);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);

    // 📊 FETCH JOURNALS
    const saleRes = await fetch(
      `${backendURL}/${orgId}/sales/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await saleRes.json();

    if (!saleRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   sales: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      sales: resultsData.sales ?? [],
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
    console.log("Error fetching sales:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getSale(orgId: string, saleId: string) {
  try {
    if (!orgId || !saleId) {
      return {
        success: false,
        error: "Organization/Sale ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/sales/${saleId}/`,
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
      sale: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching sale:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editSale(
  orgId: string,
  saleId: string,
  payload: SaleFormData
) {
  try {
    if (!orgId || !saleId) {
      return {
        success: false,
        error: "Organization/Sale ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/sales/${saleId}/`,
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
      message: data.message || "Sale entry updated successfully",
      sale: data?.sale,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing sale:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteSale(
  orgId: string,
  saleId: string
) {
  try {
    if (!orgId || !saleId) {
      return {
        success: false,
        error: "Organization/Sale ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/sales/${saleId}/`,
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
      message: data.message || "Sale entry deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting sale:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

