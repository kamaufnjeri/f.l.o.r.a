import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { formatApiError } from "@/lib/utils";

/* =========================
   LOGIN (FormData)
========================= */
export async function signIn(formData: FormData) {
  try {
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await api.post("/auth/login/", payload);


    return {
      success: true,
      message: res.data.message || 'Login Successful!'
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}


export async function logout() {
  try {
    await api.post("/auth/logout/", {}, { withCredentials: true });

    useAuthStore.getState().logout();

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: formatApiError(error),
    };
  }
}