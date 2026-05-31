import OrganisationClient from "@/components/dashboard/organisations/OrganisationClient";

export default async function OrganisationsPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <OrganisationClient />

        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="p-3 border rounded-lg">
            Dummy content {i + 1}
          </div>
        ))}
      </div>

    </div>
  );
}