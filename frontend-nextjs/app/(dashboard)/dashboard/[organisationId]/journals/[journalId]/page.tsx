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

  

  return (
    <div className="space-y-6">
      {/* <JournalDetailClient journalId={params.id} /> */}
    </div>
  );
}