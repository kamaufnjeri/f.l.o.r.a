import Header from "@/components/dashboard/layout/Header";
import RecordSale from "@/components/dashboard/sales/RecordSale";

export default async function SaleRecordPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <Header account={true} stock={true} customer={true} title="Sale Record"  description="Record new sale" />
        <RecordSale />
        
      </div>

    </div>
  );
}