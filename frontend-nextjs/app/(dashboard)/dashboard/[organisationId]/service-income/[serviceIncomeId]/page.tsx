import { getServiceIncome } from "@/app/actions/service-income-actions";
import SingleServiceIncome from "@/components/dashboard/serviceIncome/SingleServiceIncome";

type Props = {
  params: Promise<{
    organisationId: string;
    serviceIncomeId: string
  }>;
};
export default async function SingleServiceIncomePage({
  params,
}: Props) {
  const { organisationId, serviceIncomeId } = await params;

 const serviceIncomeRes = await getServiceIncome(
    organisationId,
    serviceIncomeId
  );

  if (!serviceIncomeRes.success) {
    return <div>Failed to load service income {serviceIncomeRes.error}</div>;
  }

  return (
    <div className="relative min-h-full space-y-8">
          
      <div className="space-y-4">
        <SingleServiceIncome serviceIncome={serviceIncomeRes.serviceIncome} organisationId={organisationId}/>
        
      </div>

    </div>
  );
}