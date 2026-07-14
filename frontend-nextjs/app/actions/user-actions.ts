'use server'

import { cookies } from "next/headers";
import { formatApiError } from "@/lib/utils";
import { UserFormData } from "@/types";

const backendURL = process.env.BACKEND_URL;

export async function editProfile(
  userId: string,
  payload: UserFormData
) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }
    const cookieStore = await cookies();


       const res = await fetch(`${backendURL}/auth/user-details/${userId}/`, {
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
      message: data.message || "User updated successfully",
      user: data?.user,
    };
  } catch (error) {
    console.log("Error editing user:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}



export async function archiveProfile(
  userId: string
) {
  try {
    if (!userId) {
      return {
        success: false,
        error: "User ID are required",
      };
    }
    const cookieStore = await cookies();

    const cookieHeader = cookieStore.toString();


    const res = await fetch(`${backendURL}/auth/user-details/${userId}/`, {
        method: "DELETE",
         headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
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
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.set(cookie.name, "", {
        expires: new Date(0),
        path: "/",
      });
    });

    return {
      message: data.message || "Member removed successfully",
      user: data?.user,
      success: true,
    };
  } catch (error) {
    console.log("Error removing member user:", error);

    return {
      success: false,
      error: formatApiError(error),
    };
  }
}
