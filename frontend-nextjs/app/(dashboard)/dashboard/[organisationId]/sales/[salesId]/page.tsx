import { getSale } from "@/app/actions/sale-actions";
import SingleSales from "@/components/dashboard/sales/SingleSales";

type Props = {
  params: Promise<{
    organisationId: string;
    salesId: string
  }>;
};
export default async function SingleSalesPage({
  params,
}: Props) {
  const { organisationId, salesId } = await params;

 const salesRes = await getSale(
    organisationId,
    salesId
  );

  if (!salesRes.success) {
    return <div>Failed to load sales</div>;
  }

  return (
    <div className="relative min-h-full space-y-8">
          
      <div className="space-y-4">
        <SingleSales sales={salesRes.sale} organisationId={organisationId}/>
        
      </div>

    </div>
  );
}