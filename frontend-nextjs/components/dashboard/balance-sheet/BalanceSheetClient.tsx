"use client";

import { useState } from "react";
import BalanceSheetTable from "./BalanceSheetTable";
import { BalanceSheetResponse } from "./types";

type Props = {
  organisationId: string;
  data: BalanceSheetResponse;
};

export default function BalanceSheetClient({
  organisationId,
  data,
}: Props) {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="space-y-5">
      <BalanceSheetTable
        organisationId={organisationId}
        data={data}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
    </div>
  );
}