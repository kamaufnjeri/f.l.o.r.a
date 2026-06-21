import RecordPurchase from "@/components/dashboard/purchases/RecordPurchase";
import Header from "@/components/dashboard/layout/Header";

export default async function PurchaseRecordPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <Header account={true} stock={true} supplier={true} title="Purchase Record"  description="Record new purchase" />
        <RecordPurchase />
        
      </div>

    </div>
  );
}