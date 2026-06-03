"use client";

import { useEffect } from "react";

import { User } from "@/types";
import { SelectOptions } from "@/types";

import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";

interface HydrateAppProps {
  user: User;
  selectOptions: SelectOptions | null;
  children: React.ReactNode;
}

export default function HydrateApp({
  user,
  selectOptions,
  children,
}: HydrateAppProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const setCurrentOrg = useAuthStore((s) => s.setCurrentOrg);
  const setUserOrgs = useAuthStore((s) => s.setUserOrgs);

  const setOptions = useSelectOptionsStore(
    (s) => s.setOptions
  );

  useEffect(() => {
    setUser(user);
    setCurrentOrg(user.current_organisation ?? null);
    setUserOrgs(user.user_organisations ?? []);

    // ✅ SAFE FALLBACK (NO FAIL)
    if (selectOptions) {
      setOptions(selectOptions);
    }
  }, [
    user,
    selectOptions,
    setUser,
    setCurrentOrg,
    setUserOrgs,
    setOptions,
  ]);

  return <>{children}</>;
}