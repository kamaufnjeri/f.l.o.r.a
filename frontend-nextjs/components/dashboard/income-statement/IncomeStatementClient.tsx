"use client";

import { useState } from "react";
import IncomeStatementTable from "./IncomeStatementTable";
import { IncomeStatementResponse } from "./types";


type Props = {
    organisationId: string;
    data: IncomeStatementResponse;
};


export default function IncomeStatementClient({
    organisationId,
    data
}: Props) {


    const [showDetails, setShowDetails] = useState(true);


    return (

        <div className="space-y-5">

            <IncomeStatementTable

                organisationId={organisationId}
                data={data}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
            />


        </div>

    );

}
