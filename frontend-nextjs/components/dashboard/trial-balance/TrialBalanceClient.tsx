"use client";

import { useState } from "react";
import TrialBalanceTable from "./TrialBalanceTable";
import { TrialBalanceResponse } from "./types";

type Props = {
  organisationId: string;
  data: TrialBalanceResponse;
};

export default function TrialBalanceClient({
  organisationId,
  data,
}: Props) {
  const [showCategories, setShowCategories] = useState(true);
  const [showSubCategories, setShowSubCategories] = useState(true);
  const [showAccounts, setShowAccounts] = useState(true);

  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(
    new Set()
  );
 const totalExpandableNodes = data.fixed_groups.reduce((total, group) => {
  return (
    total +
    1 + // fixed group
    group.categories.length +
    group.categories.reduce(
      (sum, category) => sum + category.sub_categories.length,
      0
    )
  );
}, 0);
const allExpanded =
  expandedNodes.size === totalExpandableNodes;

const toggleExpandAll = () => {
  if (allExpanded) {
    setExpandedNodes(new Set());
    return;
  }

  const ids = new Set<string | number>();

  data.fixed_groups.forEach((group) => {
    ids.add(group.id);

    group.categories.forEach((category) => {
      ids.add(category.id);

      category.sub_categories.forEach((sub) => {
        ids.add(sub.id);
      });
    });
  });

  setExpandedNodes(ids);
};
  return (
    <div className="space-y-5">
     
      <TrialBalanceTable
        organisationId={organisationId}
        data={data}
        showCategories={showCategories}
        setShowCategories={setShowCategories}
        showSubCategories={showSubCategories}
        setShowSubCategories={setShowSubCategories}
        showAccounts={showAccounts}
        setShowAccounts={setShowAccounts}
        allExpanded={allExpanded}
        toggleExpandAll={toggleExpandAll}
        expandedNodes={expandedNodes}
        setExpandedNodes={setExpandedNodes}
      />

    </div>
  );
}