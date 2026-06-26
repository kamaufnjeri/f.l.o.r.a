import { getPurchase } from "@/app/actions/purchase-actions";
import EditPurchase from "@/components/dashboard/purchases/EditPurchase";
import Header from "@/components/dashboard/layout/Header";

type Props = {
  params: Promise<{
    organisationId: string;
    purchaseId: string
  }>;
};
export default async function EditPurchasePage({
  params,
}: Props) {
  const { organisationId, purchaseId } = await params;

 const purchaseRes = await getPurchase(
    organisationId,
    purchaseId
  );
  if (!purchaseRes.success) {
    return <div>Failed to load purchase.{purchaseRes.error}</div>;
  }

  return (
   <div className="relative min-h-full space-y-8">
        
    <div className="space-y-4">
        <Header account={true} stock={true} supplier={true} title="Purchase Update"  description="Update purchase" />
        <EditPurchase purchase={purchaseRes.purchase} />
    </div>

    </div>
  )
};