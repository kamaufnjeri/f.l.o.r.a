"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const backendURL = process.env.BACKEND_URL;

export async function createStock(orgId: string, formData: FormData) {
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
        unit_name: formData.get("unit_name"),
        unit_alias: formData.get("unit_alias"),

        opening_stock_quantity: Number(formData.get("opening_stock_quantity")),
        opening_stock_rate: Number(formData.get("opening_stock_rate")),
    };

    const res = await fetch(`${backendURL}/${orgId}/stocks/`, {
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
    revalidatePath(`/dashboard/${orgId}/stocks`)


    return {
      success: true,
      message: data.message || "Stock created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getStocks(orgId: string, params: { search?: string; name?: string; page?: string }) {
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
    const stockRes = await fetch(
      `${backendURL}/${orgId}/stocks/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await stockRes.json();

    if (!stockRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   stocks: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      stocks: resultsData.stocks ?? [],
      totals: resultsData.totals ?? null,
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching stocks:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getStock(orgId: string, stockId: string, params: { date : string }) {
  try {
    if (!orgId || !stockId) {
      return {
        success: false,
        error: "Organization/Stock ID is required",
      };
    }
    const cookieStore = await cookies();

      // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    if (params.date) query.set("date", params.date);


    const res = await fetch(
      `${backendURL}/${orgId}/stocks/${stockId}/?${query.toString()}`,
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
      stock: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching stock:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editStock(
  orgId: string,
  stockId: string,
  formData: FormData
) {
  try {
    if (!orgId || !stockId) {
      return {
        success: false,
        error: "Organization/Stock ID is required",
      };
    }
    const cookieStore = await cookies();
    const payload = {
      name: formData.get("name"),
      unit_name: formData.get('unit_name'),
      unit_alias: formData.get('unit_alias')
    };


    const res = await fetch(
      `${backendURL}/${orgId}/stocks/${stockId}/`,
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
    revalidatePath(`/dashboard/${orgId}/stocks/${stockId}`);
    return {
      success: true,
      message: data.message || "Stock updated successfully",
      stock: data?.stock,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing stock:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteStock(
  orgId: string,
  stockId: string
) {
  try {
    if (!orgId || !stockId) {
      return {
        success: false,
        error: "Organization/Stock ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/stocks/${stockId}/`,
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
      message: data.message || "Stock deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting stock:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}