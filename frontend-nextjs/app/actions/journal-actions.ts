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
      message: data.message || "Journal entry created successfully",
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
