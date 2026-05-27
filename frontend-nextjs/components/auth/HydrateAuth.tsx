"use client";

import { useEffect } from "react";
import { User } from "@/types";
import { useAuthStore } from "@/app/stores/auth-store";

export default function HydrateAuth({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setOrg = useAuthStore((s) => s.setOrg);
  const setUserOrgs = useAuthStore((s) => s.setUserOrgs);

  useEffect(() => {
    if (!user) return;

    setUser(user);
    setOrg(user.current_organisation ?? null);
    setUserOrgs(user.user_organisations ?? []);
  }, [user, setUser, setOrg, setUserOrgs]);

  return <>{children}</>;
}