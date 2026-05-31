"use server"

import api from "@/lib/api";
import { formatApiError } from "@/lib/utils";
import { cookies } from "next/headers";

const backendURL = process.env.BACKEND_URL;

export async function signUp(formData: FormData) {
  try {
    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number"),
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
    };

    const res = await api.post("/auth/register/", payload);

    return {
      success: true,
      message: res.data?.message || "Registration successful",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function verifyEmail(uidb64: string, token: string) {
  try {
    const res = await api.get(`/auth/confirm-email/${uidb64}/${token}/`);
    console.log('Response',res);

    return {
      success: true,
      message: res.data?.message || "Email verified successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const payload = {
      email: formData.get("email"),
    };

    const res = await api.post("/auth/forgot-password/", payload);

    return {
      success: true,
      message:
        res.data?.message ||
        "Password reset link sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function resetPassword(
  uidb64: string,
  token: string,
  formData: FormData
) {
  try {
    const payload = {
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
    };

    const res = await api.post(
      `/auth/reset-password/${uidb64}/${token}/`,
      payload
    );

    return {
      success: true,
      redirectTo: '/sign-in',
      message:
        res.data?.message ||
        "Password reset successful",

    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function fetchMe() {
  try {
    const cookieStore = await cookies();

    const res = await fetch(`${backendURL}/auth/me/`, {
      method: "GET",
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        user: null,
      };
    }

    const user = await res.json();

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.log("Error", error);
    return {
      success: false,
      user: null,
    };
  }
}


export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${backendURL}/auth/logout/`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    // Even if backend fails, we still clear local cookies
    cookieStore.getAll().forEach((cookie) => {
      cookieStore.set(cookie.name, "", {
        expires: new Date(0),
        path: "/",
      });
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Error! Try again later.",
      };
    }

    return {
      success: true,
      message: "Logout successful!",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}

export async function acceptInvite(uidb64: string, formData: FormData) {
  try {
    const payload = {
      email: formData.get("email"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone_number: formData.get("phone_number"),
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
      is_login: formData.get("is_login") === "true",
    };

    const res = await api.post(
      `/organisations/accept-invite/${uidb64}/`,
      payload
    );

    return {
      success: true,
      message: res.data?.message || "Invitation accepted successfully",
      redirectTo: "/sign-in",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}