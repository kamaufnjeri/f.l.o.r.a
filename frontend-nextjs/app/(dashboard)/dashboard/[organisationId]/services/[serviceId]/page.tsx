import { getService } from "@/app/actions/service-actions";
import ItemFiltersSection from "@/components/dashboard/accounts/ItemFiltersSection";
import SingleService from "@/components/dashboard/services/SingleService";

type SearchParams = {
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
    serviceId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function ServicesPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, serviceId } = await params;

  const {
    date = "",
  } = await searchParams ?? {};

  const serviceResponse = await getService(organisationId, serviceId, {
    date
  });

  // ❌ ERROR STATE
  if (!serviceResponse.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load service. Please try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
    
      <div className="space-y-4">
      <ItemFiltersSection title={`${serviceResponse.service.name} Service`} goToUrl={`services/${serviceResponse.service.id}`} defaultDate={date} organisationId={organisationId} />
      <SingleService service={serviceResponse.service} organisationId={organisationId} date={date}/>
     </div>
    </div>
  );
}