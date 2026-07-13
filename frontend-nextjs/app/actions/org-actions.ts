'use server'

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { OrganisationFormData } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function createOrganization(formData: FormData) {
  try {
    const cookieStore = await cookies();

    const payload = {
      org_name: formData.get("org_name"),
      org_email: formData.get("org_email"),
      country: formData.get("country"),
      currency: formData.get("currency"),
      org_phone_number: formData.get("org_phone_number"),
    };

    const res = await fetch(`${backendURL}/organisations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(), // 👈 IMPORTANT (auth)
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
      message: data?.message || "Organization created",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function sendInvites(formData: FormData, orgId?:  string | null) {
  try {
    if (!orgId) {
      return { success: false, error: "Missing organisation Id" };
    }
    const cookieStore = await cookies();

    // 👇 emails come as JSON string from hidden input
    const invitesRaw = formData.get("invites") as string;

    const invites = invitesRaw ? JSON.parse(invitesRaw) : [];

    const res = await fetch(`${backendURL}/organisations/${orgId}/send-invite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify(invites),
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
      message: data?.message || "Invitations sent successfully",
      user: data?.user,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function changeOrganisation(orgId?:  string | null) {
  try {
    if (!orgId) {
      return { success: false, error: "Missing organisation Id" };
    }
    const cookieStore = await cookies();


    const res = await fetch(`${backendURL}/organisations/change-current-organisation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ org_id: orgId }),
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
      message: data?.message || "Organisation changed successfully",
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function editOrganisation(
  orgId: string,
  payload: OrganisationFormData | { is_archived: boolean}
) {
  try {
    if (!orgId) {
      return {
        success: false,
        error: "Organization ID is required",
      };
    }
    const cookieStore = await cookies();


       const res = await fetch(`${backendURL}/organisations/${orgId}/`, {
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
      message: data.message || "Organisation updated successfully",
      organisation: data?.organisation,
    };
  } catch (error) {
    console.log("Error editing organisation:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function ChangeMemberRoleOrganisation(
  orgId: string,
  userId: string,
  userRole: "viewer" | "editor" | "admin"
) {
  try {
    if (!orgId || !userId) {
      return {
        success: false,
        error: "Organization ID and User ID are required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(`${backendURL}/organisations/${orgId}/remove-member/`, {
        method: "DELETE",
         headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify({ user_id: userId, user_role: userRole }),
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
      message: data.message || "Member removed successfully",
      user: data?.user,
      success: true,
    };
  } catch (error) {
    console.log("Error removing member organisation:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}



export async function removeMemberOrganisation(
  orgId: string,
  userId: string
) {
  try {
    if (!orgId || !userId) {
      return {
        success: false,
        error: "Organization ID and User ID are required",
      };
    }
    const cookieStore = await cookies();


    const res = await fetch(`${backendURL}/organisations/${orgId}/remove-member/`, {
        method: "DELETE",
         headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify({ user_id: userId }),
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
      message: data.message || "Member removed successfully",
      user: data?.user,
      success: true,
    };
  } catch (error) {
    console.log("Error removing member organisation:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

