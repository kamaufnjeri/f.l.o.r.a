"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";

const backendURL = process.env.BACKEND_URL;

export async function getTrialBalance(orgId: string, params: { search?: string; name?: string; date?: string }) {
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


    if (params.search) query.set("search", params.search);
    if (params.name) query.set("name", params.name);
    if (params.date) query.set("date", params.date);

  
    // 📊 FETCH JOURNALS
    const reportRes = await fetch(
      `${backendURL}/${orgId}/reports/trial-balance/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await reportRes.json();

    if (!reportRes.ok) {
      
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
      trialBalance: data ?? [],
    };
  } catch (error) {
    console.log("Error fetching accounts:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function getIncomeStatement(orgId: string, params: { date?: string }) {
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
    const reportRes = await fetch(
      `${backendURL}/${orgId}/reports/income-statement/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await reportRes.json();

    if (!reportRes.ok) {
      
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
      incomeStatement: data ?? [],
    };
  } catch (error) {

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function getBalanceSheet(orgId: string, params: { date?: string }) {
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
    const reportRes = await fetch(
      `${backendURL}/${orgId}/reports/balance-sheet/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await reportRes.json();

    if (!reportRes.ok) {
      
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
      balanceSheet: data ?? [],
    };
  } catch (error) {

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function getCashFlow(orgId: string, params: { date?: string }) {
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
    const reportRes = await fetch(
      `${backendURL}/${orgId}/reports/cash-flow/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await reportRes.json();

    if (!reportRes.ok) {
      
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
      cashFlow: data ?? [],
    };
  } catch (error) {

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}
