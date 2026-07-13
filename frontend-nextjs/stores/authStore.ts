// stores/auth-store.ts

import { Organisation, OrgUser, User, UserOrganisation } from "@/types";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  currentOrg: Organisation | null;
  userOrgs: UserOrganisation[];
  currentOrgUsers: OrgUser[];
  setUser: (user: User | null) => void;
  setCurrentOrg: (org: Organisation | null) => void;
  setUserOrgs: (orgs: UserOrganisation[]) => void;
  setCurrentOrgUsers: (users: OrgUser[]) => void;
  setAuth: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentOrg: null,
  userOrgs: [],
  currentOrgUsers: [],

  setUser: (user) =>
    set({
      user,
      currentOrg: user?.current_organisation ?? null,
      userOrgs: user?.user_organisations ?? [],
      currentOrgUsers: user?.current_organisation?.org_users ?? [],
    }),

  setCurrentOrg: (org) =>
    set({
      currentOrg: org,
      currentOrgUsers: org?.org_users ?? [],
    }),

  setCurrentOrgUsers: (users) =>
    set({
      currentOrgUsers: users,
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