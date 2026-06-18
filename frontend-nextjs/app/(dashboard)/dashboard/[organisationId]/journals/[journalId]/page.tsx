import { getJournal } from "@/app/actions/journal-actions";
import JournalClient from "@/components/dashboard/journals/JournalClient";

type Props = {
  params: Promise<{
    organisationId: string;
    journalId: string
  }>;
};
export default async function JournalPage({
  params,
}: Props) {
  const { organisationId, journalId } = await params;

 const journalRes = await getJournal(
    organisationId,
    journalId
  );

  if (!journalRes.success) {
    return <div>Failed to load journal</div>;
  }

  return (
    <div className="relative min-h-full space-y-8">
          
      <div className="space-y-4">
        <JournalClient journal={journalRes.journal} />
        
      </div>

    </div>
  );
}