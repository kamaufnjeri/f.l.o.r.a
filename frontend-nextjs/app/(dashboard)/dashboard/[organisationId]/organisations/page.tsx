import OrganisationClient from "@/components/dashboard/organisations/OrganisationClient";

export default async function OrganisationsPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <OrganisationClient />

        
      </div>

    </div>
  );
}