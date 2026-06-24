"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { SalesType, ServiceIncomeFormData } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function recordServiceIncome(orgId: string, payload: ServiceIncomeFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    

    const res = await fetch(`${backendURL}/${orgId}/service-income/`, {
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
      message: data.message || "Service income created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getServiceIncomes(orgId: string, params: { search?: string; service_income: SalesType, date?: string; sort_by?: string; page?: string }) {
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
    if (params.service_income) query.set("service_income", params.service_income);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);

    // 📊 FETCH JOURNALS
    const serviceIncomeRes = await fetch(
      `${backendURL}/${orgId}/service-income/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await serviceIncomeRes.json();

    if (!serviceIncomeRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   serviceIncomes: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      serviceIncomes: resultsData.service_income ?? [],
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
    console.log("Error fetching service incomes:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getServiceIncome(orgId: string, serviceIncomeId: string) {
  try {
    if (!orgId || !serviceIncomeId) {
      return {
        success: false,
        error: "Organization/Service income ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/service-income/${serviceIncomeId}/`,
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
      serviceIncome: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching service income:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editServiceIncome(
  orgId: string,
  serviceIncomeId: string,
  payload: ServiceIncomeFormData
) {
  try {
    if (!orgId || !serviceIncomeId) {
      return {
        success: false,
        error: "Organization/Service income ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/service-income/${serviceIncomeId}/`,
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
      message: data.message || "Service income entry updated successfully",
      serviceIncome: data?.serviceIncome,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing serviceIncome:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteServiceIncome(
  orgId: string,
  serviceIncomeId: string
) {
  try {
    if (!orgId || !serviceIncomeId) {
      return {
        success: false,
        error: "Organization/Service income ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/service-income/${serviceIncomeId}/`,
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
      message: data.message || "Service income entry deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting serviceIncome:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}