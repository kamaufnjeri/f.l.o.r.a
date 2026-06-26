import { getServiceIncome } from "@/app/actions/service-income-actions";
import Header from "@/components/dashboard/layout/Header";
import EditServiceIncome from "@/components/dashboard/serviceIncome/editServiceIncome";

type Props = {
  params: Promise<{
    organisationId: string;
    serviceIncomeId: string
  }>;
};
export default async function EditServiceIncomePage({
  params,
}: Props) {
  const { organisationId, serviceIncomeId } = await params;

 const serviceIncomeRes = await getServiceIncome(
    organisationId,
    serviceIncomeId
  );
  if (!serviceIncomeRes.success) {
    return <div>Failed to load service income.{serviceIncomeRes.error}</div>;
  }

  return (
   <div className="relative min-h-full space-y-8">
        
    <div className="space-y-4">
        <Header account={true} service={true} supplier={true} title="Service Income Update"  description="Update serviceIncome" />
        <EditServiceIncome serviceIncome={serviceIncomeRes.serviceIncome} />
    </div>

    </div>
  )
};