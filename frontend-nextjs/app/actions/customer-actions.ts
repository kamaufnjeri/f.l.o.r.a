"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const backendURL = process.env.BACKEND_URL;

export async function createCustomer(orgId: string, formData: FormData) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone_number: formData.get("phone_number"),

    };

    const res = await fetch(`${backendURL}/${orgId}/customers/`, {
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
    revalidatePath(`/dashboard/${orgId}/customers`);
    return {
      success: true,
      message: data.message || "Customer created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getCustomers(orgId: string, params: { search?: string; name?: string; page?: string }) {
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
    if (params.name) query.set("name", params.name);
    if (params.page) query.set("page", params.page);
  
    // 📊 FETCH JOURNALS
    const customerRes = await fetch(
      `${backendURL}/${orgId}/customers/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await customerRes.json();

    if (!customerRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   customers: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      customers: resultsData.customers ?? [],
      totals: resultsData.totals ?? null,
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching customers:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getCustomer(orgId: string, customerId: string, params: { date : string }) {
  try {
    if (!orgId || !customerId) {
      return {
        success: false,
        error: "Organization/Customer ID is required",
      };
    }
    const cookieStore = await cookies();

      // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    if (params.date) query.set("date", params.date);


    const res = await fetch(
      `${backendURL}/${orgId}/customers/${customerId}/?${query.toString()}`,
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
      customer: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching customer:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editCustomer(
  orgId: string,
  customerId: string,
  formData: FormData
) {
  try {
    if (!orgId || !customerId) {
      return {
        success: false,
        error: "Organization/Customer ID is required",
      };
    }
    const cookieStore = await cookies();
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),

    };


    const res = await fetch(
      `${backendURL}/${orgId}/customers/${customerId}/`,
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
    revalidatePath(`/dashboard/${orgId}/customers/${customerId}`);
    return {
      success: true,
      message: data.message || "Customer updated successfully",
      customer: data?.customer,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing customer:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteCustomer(
  orgId: string,
  customerId: string
) {
  try {
    if (!orgId || !customerId) {
      return {
        success: false,
        error: "Organization/Customer ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/customers/${customerId}/`,
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
      message: data.message || "Customer deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting customer:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}