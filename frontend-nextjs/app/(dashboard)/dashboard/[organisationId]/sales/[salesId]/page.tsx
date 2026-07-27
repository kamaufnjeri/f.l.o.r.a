import { getSale } from "@/app/actions/sale-actions";
import SingleSale from "@/components/dashboard/sales/SingleSale";

type Props = {
  params: Promise<{
    organisationId: string;
    salesId: string
  }>;
};
export default async function SingleSalePage({
  params,
}: Props) {
  const { organisationId, salesId } = await params;

 const salesRes = await getSale(
    organisationId,
    salesId
  );

  if (!salesRes.success) {
    return <div>Failed to load sale</div>;
  }

  return (
    <div className="relative min-h-full space-y-8">
          
      <div className="space-y-4">
        <SingleSale sale={salesRes.sale} organisationId={organisationId}/>
        
      </div>

    </div>
  );
}