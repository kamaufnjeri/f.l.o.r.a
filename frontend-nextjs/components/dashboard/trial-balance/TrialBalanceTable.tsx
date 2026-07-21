"use client";

import TrialBalanceNode from "./TrialBalanceNode";
import TrialBalanceTotals from "./TrialBalanceTotals";
import { TrialBalanceFixedGroup } from "./types";

type Props = {
  organisationId: string;
  data: {
    fixed_groups: TrialBalanceFixedGroup[];
    totals: {
      debit: number;
      credit: number;
    };
  };

  showCategories: boolean;
  showSubCategories: boolean;
  showAccounts: boolean;
 expandedNodes: Set<string | number>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string | number>>>;};

export default function TrialBalanceTable({
  organisationId,
  data,
  showCategories,
  showSubCategories,
  showAccounts,
  expandedNodes,
  setExpandedNodes
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">

          {/* Header */}

          <thead className="sticky top-0 z-20 bg-gray-50">
            <tr className="border-b">

              <th className="p-4 text-left font-semibold text-gray-700">
                Name
              </th>

              <th className="w-44 p-4 text-right font-semibold text-gray-700">
                Debit
              </th>

              <th className="w-44 p-4 text-right font-semibold text-gray-700">
                Credit
              </th>

              <th className="w-24"></th>

            </tr>
          </thead>

          {/* Body */}

          <tbody>

            {data.fixed_groups.map(group => (

              <TrialBalanceNode
                key={group.id}
                item={group}
                level={0}
                //type="group"
                organisationId={organisationId}
                showCategories={showCategories}
                showSubCategories={showSubCategories}
                showAccounts={showAccounts}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
              />

            ))}

          </tbody>
          <TrialBalanceTotals totals={data.totals}/>

        </table>
      </div>
    </div>
  );
}