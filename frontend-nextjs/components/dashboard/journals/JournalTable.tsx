type JournalEntry = {
  id: number;
  account_name: string;
  debit_credit: "debit" | "credit";
  amount: number;
};

type Journal = {
  id: number;
  serial_number: string;
  date: string;
  description: string;
  journal_entries: JournalEntry[];
};

export default function JournalTable({
  journals,
  totals,
}: {
  journals: Journal[];
  totals: {
    debit_total: number;
    credit_total: number;
  };
}) {
  return (
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Date</th>
            <th className="p-2" colSpan={2}>
              Account
            </th>
            <th className="p-2">Debit</th>
            <th className="p-2">Credit</th>
          </tr>
        </thead>

        <tbody>
          {journals.map((journal) => (
            <>
              {journal.journal_entries.map((entry, i) => (
                <tr key={entry.id} className="border-t">
                  {i === 0 && (
                    <>
                      <td rowSpan={journal.journal_entries.length + 1}>
                        {journal.serial_number}
                      </td>

                      <td rowSpan={journal.journal_entries.length + 1}>
                        {journal.date}
                      </td>
                    </>
                  )}

                  <td colSpan={2}>{entry.account_name}</td>

                  <td className="text-right">
                    {entry.debit_credit === "debit"
                      ? entry.amount
                      : "-"}
                  </td>

                  <td className="text-right">
                    {entry.debit_credit === "credit"
                      ? entry.amount
                      : "-"}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-50">
                <td colSpan={5} className="italic text-center">
                  {journal.description}
                </td>
              </tr>
            </>
          ))}

          <tr className="font-bold bg-gray-200">
            <td colSpan={4}>Totals</td>
            <td className="text-right">{totals.debit_total}</td>
            <td className="text-right">{totals.credit_total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}