"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { JournalFormData, PurchaseFormData } from "@/types";

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

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      return {
        success: false,
        error: formatApiError(errorData),
      };
    }

    const data = await res.json();

    return {
      success: true,
      message: data.message || "Purchase entry created successfully",
      serial_numbers: data.serial_numbers|| null,
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

export async function getJournal(orgId: string, journalId: string) {
  try {
    if (!orgId || !journalId) {
      return {
        success: false,
        error: "Organization/Journal ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/journals/${journalId}/`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return {
        success: false,
        error: "Failed to fetch journal",
        journal: null,
      };
    }

    const data = await res.json();

    return {
      success: true,
      journal: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching journal:", error);

    return {
      success: false,
      error: formatApiError(error),
      journal: null,
    };
  }
}

export async function editJournal(
  orgId: string,
  journalId: string,
  payload: JournalFormData
) {
  try {
    if (!orgId || !journalId) {
      return {
        success: false,
        error: "Organization/Journal ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/journals/${journalId}/`,
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
        error: data?.message || "Failed to update journal",
      };
    }

    return {
      success: true,
      message: "Journal updated successfully",
      journal: data?.data ?? data,
    };
  } catch (error) {
    console.log("Error editing journal:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteJournal(
  orgId: string,
  journalId: string
) {
  try {
    if (!orgId || !journalId) {
      return {
        success: false,
        error: "Organization/Journal ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/journals/${journalId}/`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieStore.toString(),
        },
      }
    );

    if (!res.ok) {
      const data = await res.json();

      return {
        success: false,
        error: data?.message || "Failed to delete journal",
      };
    }

    return {
      success: true,
      message: "Journal deleted successfully",
    };
  } catch (error) {
    console.log("Error deleting journal:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}