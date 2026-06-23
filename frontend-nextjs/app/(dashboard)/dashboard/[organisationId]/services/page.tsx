import { getServices } from "@/app/actions/service-actions";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import ServiceTable from "@/components/dashboard/services/ServicesTable";
import Pagination from "@/components/dashboard/journals/Pagination";
import NoItem from "@/components/dashboard/accounts/NoItem";

type SearchParams = {
  search?: string;
  name?: string;
  page?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function ServicesPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    name = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getServices(organisationId, {
    search,
    name,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load services. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const services = response.services || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection service={true} title={'Services'} goToUrl={'services'} filters={{ search, name, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {services.length === 0 ? (
         <NoItem title="Services" modalName="service"/>
      ) : (
        <>
          
          <ServiceTable
            services={services}
          />

          {response.pagination && (
            <Pagination
              organisationId={organisationId}
              pagination={response.pagination}
              goToUrl={'services'}
            />
          )} 
        </>
      )}
    </div>
  );
}