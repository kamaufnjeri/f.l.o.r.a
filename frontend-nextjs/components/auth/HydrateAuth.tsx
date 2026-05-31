"use client";

import { useEffect } from "react";
import { User } from "@/types";
import { useAuthStore } from "@/stores/authStore";

export default function HydrateAuth({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setCurrentOrg = useAuthStore((s) => s.setCurrentOrg);
  const setUserOrgs = useAuthStore((s) => s.setUserOrgs);

  useEffect(() => {
    if (!user) return;

    setUser(user);
    setCurrentOrg(user.current_organisation ?? null);
    setUserOrgs(user.user_organisations ?? []);
  }, [user, setUser, setCurrentOrg, setUserOrgs]);

  return <>{children}</>;
}