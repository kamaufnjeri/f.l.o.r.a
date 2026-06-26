"use server";

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { revalidatePath } from "next/cache";


const backendURL = process.env.BACKEND_URL;

export async function createAccount(orgId: string, formData: FormData) {
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
      belongs_to: formData.get("belongs_to"),
      opening_balance: formData.get("opening_balance"),
      opening_balance_type: formData.get("opening_balance_type"),
    };

    const res = await fetch(`${backendURL}/${orgId}/accounts/`, {
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
    revalidatePath(`/dashboard/${orgId}/accounts`)
    return {
      success: true,
      message: data.message || "Account created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function createAccountSubCategory(orgId: string, payload: {
  name: string;
  category: string;
}) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();

    const res = await fetch(`${backendURL}/${orgId}/accounts/sub-categories/`, {
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
      message: data.message || "Account belongs to created successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function createAccountCategory(orgId: string, payload: {
  name: string;
  group: string;
}) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();



    const res = await fetch(`${backendURL}/${orgId}/accounts/categories/`, {
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
      message: data.message || "Account category successfully",
      select_options: data.select_options|| null,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getAccounts(orgId: string, params: { search?: string; name?: string; page?: string }) {
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
    const accountRes = await fetch(
      `${backendURL}/${orgId}/accounts/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: "no-store",
      }
    );

    const data = await accountRes.json();

    if (!accountRes.ok) {
      
      return {
        success: false,
        error: formatApiError(data),
      };
    }

    const resultsData = data.results.data || {}

    // 🧾 EXPECTED BACKEND SHAPE:
    // data = {
    //   accounts: [],
    //   totals: {},
    //   next: "",
    //   previous: ""
    // }

    return {
      success: true,
      accounts: resultsData.accounts ?? [],
      totals: resultsData.totals ?? null,
      pagination: {
        next: data?.next,
        previous: data?.previous,
        page: params.page || 1,
      },
    };
  } catch (error) {
    console.log("Error fetching accounts:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function getAccount(orgId: string, accountId: string, params: { date : string }) {
  try {
    if (!orgId || !accountId) {
      return {
        success: false,
        error: "Organization/Account ID is required",
      };
    }
    const cookieStore = await cookies();

      // 🧠 BUILD QUERY PARAMS
    const query = new URLSearchParams();

    if (params.date) query.set("date", params.date);


    const res = await fetch(
      `${backendURL}/${orgId}/accounts/${accountId}/?${query.toString()}`,
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
      account: data?.data ?? data ?? null,
    };
  } catch (error) {
    console.log("Error fetching account:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function editAccount(
  orgId: string,
  accountId: string,
  formData: FormData
) {
  try {
    if (!orgId || !accountId) {
      return {
        success: false,
        error: "Organization/Account ID is required",
      };
    }
    const cookieStore = await cookies();
    const payload = {
      name: formData.get("name"),
    };


    const res = await fetch(
      `${backendURL}/${orgId}/accounts/${accountId}/`,
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
    revalidatePath(`/dashboard/${orgId}/accounts/${accountId}`);

    return {
      success: true,
      message: data.message || "Account updated successfully",
      account: data?.account,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing account:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteAccount(
  orgId: string,
  accountId: string
) {
  try {
    if (!orgId || !accountId) {
      return {
        success: false,
        error: "Organization/Account ID is required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/accounts/${accountId}/`,
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
      message: data.message || "Account deleted successfully",
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting account:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function editCategory(
  orgId: string,
  type: 'categories' | 'sub-categories',
  categoryId: string,
  payload: {
    name: string;
}) {
  try {
    if (!orgId || !categoryId) {
      return {
        success: false,
        error: `Organization/${type} ID is required`,
      };
    }
    const cookieStore = await cookies();
    

    const res = await fetch(
      `${backendURL}/${orgId}/accounts/${type}/${categoryId}/`,
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
      message: data.message || `Account ${type} updated successfully`,
      category: data?.category,
      select_options: data?.select_options
    };
  } catch (error) {
    console.log("Error editing account category:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function deleteCategory(
  orgId: string,
  categoryId: string,
    type: 'categories' | 'sub-categories',

) {
  try {
    if (!orgId || !categoryId) {
      return {
        success: false,
        error: `Organization/${type} ID is required`,
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(
      `${backendURL}/${orgId}/accounts/${type}/${categoryId}/`,
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
      message: data.message || `Account ${type} deleted successfully`,
      
      success: true,
      select_options: data?.select_options,
    };
  } catch (error) {
    console.log("Error deleting account category:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}