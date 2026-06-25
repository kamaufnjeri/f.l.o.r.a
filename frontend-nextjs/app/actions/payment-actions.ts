"use server";

import { formatApiError } from "@/lib/utils";
import { PaymentFormData, paymentType } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const backendURL = process.env.BACKEND_URL;

export async function recordPayment(orgId: string, revalidateUrl: string, payload: PaymentFormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    

    const res = await fetch(`${backendURL}/${orgId}/payments/`, {
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
      message: data.message || "Payment created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getPayments(orgId: string, params: { search?: string; type: paymentType, date?: string; sort_by?: string; page?: string }) {
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
    if (params.type) query.set("type", params.type);
    if (params.date) query.set("date", params.date);
    if (params.sort_by) query.set("sort_by", params.sort_by);
    if (params.page) query.set("page", params.page);
    // 📊 FETCH JOURNALS
    const paymentRes = await fetch(
      `${backendURL}/${orgId}/payments/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await paymentRes.json();

    if (!paymentRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   payments: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      payments: resultsData.payments ?? [],
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
    console.log("Error fetching payments:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getPayment(orgId: string, paymentId: string) {
  try {
    if (!orgId || !paymentId) {
      return {
        success: false,
        error: "Organization/Payment ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/payments/${paymentId}/`,
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
      payment: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching payment:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editPayment(
  orgId: string,
  paymentId: string,
  payload: PaymentFormData,
  revalidateUrl: string,
) {
  try {
    if (!orgId || !paymentId) {
      return {
        success: false,
        error: "Organization/Payment ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/payments/${paymentId}/`,
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
      message: data.message || "Payment entry updated successfully",
      payment: data?.payment,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing payment:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deletePayment(
  orgId: string,
  paymentId: string,
  revalidateUrl: string
) {
  try {
    if (!orgId || !paymentId) {
      return {
        success: false,
        error: "Organization/Payment ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/payments/${paymentId}/`,
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
      message: data.message || "Payment entry deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting payment:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getBillInvoicePayments(orgId: string, billInvoiceId: string, type: 'invoices' | 'bills', params: { page: string }) {
  try {
    if (!orgId || !billInvoiceId) {
      return {
        success: false,
        error: "Organization/Invoice/Bill ID is required",
      };
    }
    const cookieStore = await cookies();

    // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    query.set("paginate", "true");
    if (params.page) query.set("page", params.page);
    // 📊 FETCH JOURNALS
    const paymentRes = await fetch(
      `${backendURL}/${orgId}/${type}/${billInvoiceId}/payments/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await paymentRes.json();


    if (!paymentRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   payments: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }
    console.log('***/n', resultsData.payments[0].journal_entries_total)

    return {
      success: true,
      title: resultsData.title ?? "",
      payments: resultsData.payments ?? [],
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
    console.log("Error fetching payments:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}