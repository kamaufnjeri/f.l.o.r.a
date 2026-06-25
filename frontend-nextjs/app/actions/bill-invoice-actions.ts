"use server"

import { formatApiError } from "@/lib/utils";
import { DueDaysType, StatusType } from "@/types";
import { cookies } from "next/headers";

const backendURL = process.env.BACKEND_URL;

export async function getBills(orgId: string, params: { search?: string; status: StatusType, due_days?: DueDaysType; page?: string }) {
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
    if (params.status) query.set("status", params.status);
    if (params.due_days) query.set("due_days", params.due_days);
    if (params.page) query.set("page", params.page);

    // 📊 FETCH JOURNALS
    const billRes = await fetch(
      `${backendURL}/${orgId}/bills/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await billRes.json();

    if (!billRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   bills: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      bills: resultsData.bills ?? [],
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
    console.log("Error fetching bills:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getInvoices(orgId: string, params: { search?: string; status: StatusType, due_days?: DueDaysType; page?: string }) {
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
    if (params.status) query.set("status", params.status);
    if (params.due_days) query.set("due_days", params.due_days);
    if (params.page) query.set("page", params.page);

    // 📊 FETCH JOURNALS
    const invoiceRes = await fetch(
      `${backendURL}/${orgId}/invoices/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await invoiceRes.json();

    if (!invoiceRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   invoices: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      invoices: resultsData.invoices ?? [],
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
    console.log("Error fetching invoices:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}