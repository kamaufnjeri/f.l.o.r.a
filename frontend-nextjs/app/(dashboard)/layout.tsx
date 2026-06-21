// app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { fetchMe } from "../actions/auth-actions";
import { fetchSelectOptions } from "../actions/select-actions";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import HydrateApp from "@/components/dashboard/providers/HydrateApp";
import ModalRenderer from "@/components/dashboard/layout/ModalRenderer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await fetchMe();

  if (!result.success || !result.user) {
    redirect("/sign-in");
  }

  const user = result.user;

  if (!user.current_organisation?.id) {
    redirect("/organisation-create");
  } 

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
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <ModalRenderer/>
      </div>
    </HydrateApp>
  );
}