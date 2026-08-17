// app/(dashboard)/layout.tsx

import { fetchSelectOptions } from "../actions/select-actions";
import HydrateApp from "@/components/dashboard/providers/HydrateApp";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
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
      {children}
    </HydrateApp>
  );
}

