"use client";


import CashFlowTable from "./CashFlowTable";

import { CashFlowResponse } from "./types";


type Props = {


  data: CashFlowResponse;

};



export default function CashFlowClient({


  data,

}: Props) {


  return (

    <div className="space-y-5">


      <CashFlowTable


        data={data}

      />


    </div>

  );

}