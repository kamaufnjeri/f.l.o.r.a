"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const backendURL = process.env.BACKEND_URL;

export async function createService(orgId: string, formData: FormData) {
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
        description: formData.get("description"),
    };

    const res = await fetch(`${backendURL}/${orgId}/services/`, {
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
    revalidatePath(`/dashboard/${orgId}/services`)

    return {
      success: true,
      message: data.message || "Service created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getServices(orgId: string, params: { search?: string; name?: string; page?: string }) {
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
    const serviceRes = await fetch(
      `${backendURL}/${orgId}/services/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await serviceRes.json();

    if (!serviceRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   services: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      services: resultsData ?? [],
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching services:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getService(orgId: string, serviceId: string, params: { date : string }) {
  try {
    if (!orgId || !serviceId) {
      return {
        success: false,
        error: "Organization/Service ID is required",
      };
    }
    const cookieStore = await cookies();

      // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    if (params.date) query.set("date", params.date);


    const res = await fetch(
      `${backendURL}/${orgId}/services/${serviceId}/?${query.toString()}`,
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
      service: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching service:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editService(
  orgId: string,
  serviceId: string,
  formData: FormData
) {
  try {
    if (!orgId || !serviceId) {
      return {
        success: false,
        error: "Organization/Service ID is required",
      };
    }
    const cookieStore = await cookies();
    const payload = {
      name: formData.get("name"),
      description: formData.get("description")
    };


    const res = await fetch(
      `${backendURL}/${orgId}/services/${serviceId}/`,
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
    revalidatePath(`/dashboard/${orgId}/services/${serviceId}`);
    return {
      success: true,
      message: data.message || "Service updated successfully",
      service: data?.service,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing service:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteService(
  orgId: string,
  serviceId: string
) {
  try {
    if (!orgId || !serviceId) {
      return {
        success: false,
        error: "Organization/Service ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/services/${serviceId}/`,
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
      message: data.message || "Service deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting service:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}