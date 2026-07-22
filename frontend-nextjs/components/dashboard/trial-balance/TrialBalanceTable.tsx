"use client";

import { Dispatch, SetStateAction } from "react";
import {
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
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
  setShowCategories: Dispatch<SetStateAction<boolean>>;

  showSubCategories: boolean;
  setShowSubCategories: Dispatch<SetStateAction<boolean>>;

  showAccounts: boolean;
  setShowAccounts: Dispatch<SetStateAction<boolean>>;
  allExpanded: boolean;
  toggleExpandAll: () => void;

  expandedNodes: Set<string | number>;
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string | number>>>;
};

export default function TrialBalanceTable({
  organisationId,
  data,
  showCategories,
  setShowCategories,
  showSubCategories,
  setShowSubCategories,
  showAccounts,
  setShowAccounts,
  allExpanded,
  toggleExpandAll,
  expandedNodes,
  setExpandedNodes
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">

          {/* Header */}

          <thead className="sticky top-0 z-20 bg-gray-50">
            <tr>
              <td colSpan={4} className="px-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-4">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCategories}
                      onChange={(e) =>
                        setShowCategories(e.target.checked)
                      }
                    />

                    <span>Categories</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSubCategories}
                      onChange={(e) =>
                        setShowSubCategories(e.target.checked)
                      }
                    />

                    <span>Sub Categories</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAccounts}
                      onChange={(e) =>
                        setShowAccounts(e.target.checked)
                      }
                    />

                    <span>Accounts</span>
                  </label>

                  <button
                    onClick={toggleExpandAll}
                    className="flex items-center cursor-pointer gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50"
                  >
                    {allExpanded ? (
                      <>
                        <FiChevronUp />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <FiChevronDown />
                        Expand All
                      </>
                    )}
                  </button>


                </div>

              </td>
            </tr>
            <tr className="border-b">

              <th className="p-4 text-left font-semibold text-gray-700 ">
                Description

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
          <TrialBalanceTotals totals={data.totals} />

        </table>
      </div>
    </div>
  );
}