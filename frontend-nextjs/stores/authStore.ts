// stores/auth-store.ts

import { Organisation, User } from "@/types";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  currentOrg: Organisation | null;
  userOrgs: Organisation[];

  setUser: (user: User | null) => void;
  setCurrentOrg: (org: Organisation | null) => void;
  setUserOrgs: (orgs: Organisation[]) => void;

  setAuth: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentOrg: null,
  userOrgs: [],

  setUser: (user) =>
    set({
      user,
    }),

  setCurrentOrg: (org) =>
    set({
      currentOrg: org,
    }),

  setUserOrgs: (orgs) =>
    set({
      userOrgs: orgs,
    }),

  setAuth: (user) =>
    set({
      user,
      currentOrg: user.current_organisation ?? null,
      userOrgs: user.user_organisations ?? [],
    }),

  logout: () =>
    set({
      user: null,
      currentOrg: null,
      userOrgs: [],
    }),
}));