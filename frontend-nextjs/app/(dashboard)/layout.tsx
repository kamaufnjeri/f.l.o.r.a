// app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { fetchSelectOptions } from "../actions/select-actions";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import HydrateApp from "@/components/dashboard/providers/HydrateApp";
import ModalRenderer from "@/components/dashboard/layout/ModalRenderer";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();


  const selectOptionsResult = await fetchSelectOptions(
    user.current_organisation.id
  );
  const selectOptions = selectOptionsResult.success && selectOptionsResult.selectOptions
    ? selectOptionsResult.selectOptions
    : null;

  return (
    <HydrateApp
      user={user}
      selectOptions={selectOptions}
    >
      {children}
    </HydrateApp>
  );
}

