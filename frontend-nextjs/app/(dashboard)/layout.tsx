// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { fetchMe } from "../actions/auth-actions";
import HydrateAuth from "@/components/auth/HydrateAuth";
import OrganizationCreateForm from "@/components/organisation/OrganisationCreateForm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await fetchMe();

  // 🚨 NOT AUTHENTICATED → redirect
  if (!result.success || !result.user) {
    redirect("/sign-in");
  }

  const user = result.user;

  const currentOrgId = user.current_organisation.id;

  return (
    <HydrateAuth user={user}>
      {currentOrgId ? (
        // ✅ FULL APP
        children
      ) : (
        // 🚨 NO ORG → ONBOARDING
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-xl">
            <OrganizationCreateForm />
          </div>
        </div>
      )}
    </HydrateAuth>
  );
}