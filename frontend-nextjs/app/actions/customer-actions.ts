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
    if (params.name) query.set("date", params.name);
  
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
    revalidatePath(`/dashboard/${orgId}/customers`)

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