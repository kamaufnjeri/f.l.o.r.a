// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { fetchMe } from "../actions/auth-actions";
import HydrateAuth from "@/components/auth/HydrateAuth";
import Sidebar from "@/components/dashboard/layout/Sidebar";

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

  return (
    <HydrateAuth user={user}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
  <Sidebar />

  <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
    {children}
  </main>
</div>
    </HydrateAuth>
  );
}