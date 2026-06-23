"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const backendURL = process.env.BACKEND_URL;

export async function createSupplier(orgId: string, formData: FormData) {
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


    const res = await fetch(`${backendURL}/${orgId}/suppliers/`, {
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
    revalidatePath(`/dashboard/${orgId}/suppliers`)

    return {
      success: true,
      message: data.message || "Supplier created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getSuppliers(orgId: string, params: { search?: string; name?: string; page?: string }) {
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
    const supplierRes = await fetch(
      `${backendURL}/${orgId}/suppliers/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await supplierRes.json();

    if (!supplierRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   suppliers: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      suppliers: resultsData.suppliers ?? [],
      totals: resultsData.totals ?? null,
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching suppliers:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getSupplier(orgId: string, supplierId: string, params: { date : string }) {
  try {
    if (!orgId || !supplierId) {
      return {
        success: false,
        error: "Organization/Supplier ID is required",
      };
    }
    const cookieStore = await cookies();

      // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    if (params.date) query.set("date", params.date);


    const res = await fetch(
      `${backendURL}/${orgId}/suppliers/${supplierId}/?${query.toString()}`,
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
      supplier: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching supplier:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editSupplier(
  orgId: string,
  supplierId: string,
  formData: FormData
) {
  try {
    if (!orgId || !supplierId) {
      return {
        success: false,
        error: "Organization/Supplier ID is required",
      };
    }
    const cookieStore = await cookies();
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),

    };


    const res = await fetch(
      `${backendURL}/${orgId}/suppliers/${supplierId}/`,
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
    revalidatePath(`/dashboard/${orgId}/suppliers/${supplierId}`);
    return {
      success: true,
      message: data.message || "Supplier updated successfully",
      supplier: data?.supplier,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing supplier:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteSupplier(
  orgId: string,
  supplierId: string
) {
  try {
    if (!orgId || !supplierId) {
      return {
        success: false,
        error: "Organization/Supplier ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/suppliers/${supplierId}/`,
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
      message: data.message || "Supplier deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting supplier:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}