import { getSale } from "@/app/actions/sale-actions";
import EditSales from "@/components/dashboard/sales/EditSales";
import Header from "@/components/dashboard/layout/Header";

type Props = {
  params: Promise<{
    organisationId: string;
    salesId: string
  }>;
};
export default async function EditSalePage({
  params,
}: Props) {
  const { organisationId, salesId } = await params;

 const salesRes = await getSale(
    organisationId,
    salesId
  );
  if (!salesRes.success) {
    return <div>Failed to load sales.{salesRes.error} {organisationId} {salesId}</div>;
  }

  return (
   <div className="relative min-h-full space-y-8">
        
    <div className="space-y-4">
        <Header account={true} stock={true} customer={true} title="Sale Update"  description="Update sales" />
        <EditSales sales={salesRes.sale} />
    </div>

    </div>
  )
};