import { getPurchase } from "@/app/actions/purchase-actions";
import SinglePurchase from "@/components/dashboard/purchases/SinglePurchase";

type Props = {
  params: Promise<{
    organisationId: string;
    purchaseId: string
  }>;
};
export default async function SinglePurchasePage({
  params,
}: Props) {
  const { organisationId, purchaseId } = await params;

 const purchaseRes = await getPurchase(
    organisationId,
    purchaseId
  );

  if (!purchaseRes.success) {
    return <div>Failed to load purchase</div>;
  }

  return (
    <div className="relative min-h-full space-y-8">
          
      <div className="space-y-4">
        <SinglePurchase purchase={purchaseRes.purchase} organisationId={organisationId}/>
        
      </div>

    </div>
  );
}