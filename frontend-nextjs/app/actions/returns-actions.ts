import { formatApiError } from "@/lib/utils";
import { cookies } from "next/headers";
const backendURL = process.env.BACKEND_URL;

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
