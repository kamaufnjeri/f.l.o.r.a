import { cache } from "react";
import { fetchMe } from "@/app/actions/auth-actions";

export const getCurrentUser = cache(async () => {
  const result = await fetchMe();

  if (!result.success || !result.user) {
    return null;
  }

  return result.user;
});
