"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { JournalFormData } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function recordJournal(orgId: string, payload: JournalFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    const res = await fetch(`${backendURL}/${orgId}/journals/`, {
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
      message: data.message || "Journal entry created successfully",
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

    const data = await journalRes.json();

    if (!journalRes.ok) {
      
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
      error: formatApiError(error),
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

   
    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    return {
      success: true,
      journal: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching journal:", error);

    return {
      success: false,
      error: formatApiError(error),
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
        error: formatApiError(data),
      };
    }
   
    return {
      success: true,
      message: data.message || "Journal entry updated successfully",
      journal: data?.journal,
      select_options: data?.select_options
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

    
    const data = await res.json();

    if (!res.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    return {
      message: data.message || "Journal entry deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting journal:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}