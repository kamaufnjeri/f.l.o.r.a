import Header from "@/components/dashboard/layout/Header";
import RecordServiceIncome from "@/components/dashboard/serviceIncome/RecordServiceIncome";

export default async function ServiceIncomeRecordPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <Header account={true} service={true} customer={true} title="Service Income Record"  description="Record new service income" />
        <RecordServiceIncome />
        
      </div>

    </div>
  );
}