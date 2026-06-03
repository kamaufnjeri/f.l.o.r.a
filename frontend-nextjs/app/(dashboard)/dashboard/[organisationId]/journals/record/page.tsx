import RecordJournal from "@/components/dashboard/journals/RecordJournal";
import Header from "@/components/dashboard/layout/Header";

export default async function JournalRecordPage() {
  return (
    <div className="relative min-h-full space-y-8">
      
      <div className="space-y-4">
        <Header account={true} title="Journal Record"  description="Record new journal entries" />
        <RecordJournal />
        
      </div>

    </div>
  );
}