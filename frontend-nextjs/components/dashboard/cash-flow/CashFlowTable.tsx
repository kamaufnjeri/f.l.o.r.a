"use client";

import React from "react";
import { CashFlowResponse, CashFlowEntry, CashFlowSection } from "./types";


type Props = {
  data: CashFlowResponse;
};


export default function CashFlowTable({
  data,
}: Props) {


  return (

    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


      <div className="overflow-x-auto">


        <table className="min-w-full border-collapse text-sm">


          {/* ==============================
              HEADER
          =============================== */}

          <thead className="bg-slate-800 text-white">

            <tr>


              <th className="px-6 py-4 text-left font-semibold">
                Description
              </th>


              <th className="px-6 py-4 text-right font-semibold">
                Amount
              </th>


              <th className="px-6 py-4 text-right font-semibold">
                Total
              </th>


            </tr>

          </thead>



          <tbody>



            {/* ==============================
                OPERATING ACTIVITIES
            =============================== */}


            <SectionHeader title="Cash Flows from Operating Activities" />



            <ActivitySection
              section={data.operating}
            />



            <GrandTotalRow
              title="Net Cash from Operating Activities (A)"
              total={data.operating.total}
            />



            <Spacer />





           {/* ==============================
    INVESTING ACTIVITIES
================================ */}


<SectionHeader title="Cash Flows from Investing Activities" />


{Object.keys(data.investing.entries).length > 0 ? (

  <ActivitySection
    section={data.investing}
  />

) : (

  <EmptyRow title="No investing activities" />

)}



<GrandTotalRow
  title="Net Cash from Investing Activities (B)"
  total={data.investing.total}
/>



<Spacer />





{/* ==============================
    FINANCING ACTIVITIES
================================ */}


<SectionHeader title="Cash Flows from Financing Activities" />



{Object.keys(data.financing.entries).length > 0 ? (

  <ActivitySection
    section={data.financing}
  />

) : (

  <EmptyRow title="No financing activities" />

)}



<GrandTotalRow
  title="Net Cash from Financing Activities (C)"
  total={data.financing.total}
/>



<Spacer />






{/* ==============================
    CASH RECONCILIATION
================================ */}



<SectionHeader title="Cash and Cash Equivalents Reconciliation" />




<BalanceRow

  title="Net Increase in Cash (A+B+C)"

  amount={data.net_cash_flow}

/>




<BalanceRow

  title="Cash and Cash Equivalents at Beginning"

  amount={data.opening_cash}

/>





<tr className="bg-green-700 text-white font-bold">


  <td className="px-6 py-5">

    Cash and Cash Equivalents at End of Period

  </td>



  <td>

    -

  </td>



  <td className="border-y-2 border-black px-6 py-5 text-right">


    {formatAmount(
      data.closing_cash,
      data.closing_cash < 0
    )}


  </td>


</tr>





<Spacer />





{data.reconciles ? (

<tr className="bg-green-100 text-green-800 font-bold">


  <td
    colSpan={3}
    className="px-6 py-3"
  >

    ✓ Cash Flow reconciles with Cash Balance

  </td>


</tr>


) : (


<tr className="bg-red-100 text-red-800 font-bold">


  <td
    colSpan={3}
    className="px-6 py-3"
  >

    ✗ Cash Flow does not reconcile

  </td>


</tr>


)}


          </tbody>


        </table>


      </div>


    </div>

  );

}







/* ================================================= */
/* HELPERS */
/* ================================================= */



function SectionHeader({
  title,
}: {
  title:string;
}) {


  return (

    <tr className="bg-slate-600 text-white">


      <td
        colSpan={3}
        className="px-6 py-3 text-sm font-bold uppercase tracking-wide"
      >

        {title}

      </td>


    </tr>

  );

}







function ActivitySection({
  section,
}: {
  section:CashFlowSection;
}) {


  return (

    <>

      {Object.entries(section.entries).map(
        ([lineItem, line])=>(


          <React.Fragment key={lineItem}>


            <tr className="bg-slate-200">


              <td
                colSpan={3}
                className="px-6 py-2 font-semibold text-slate-700"
              >

                {lineItem}

              </td>


            </tr>





            {line.entries.map(
              (entry:CashFlowEntry)=>(
                

                <CashFlowRow
                  key={`${entry.date}-${entry.description}-${entry.amount}`}
                  entry={entry}
                />


              )
            )}




            <TotalRow

              title={`Total ${lineItem}`}

              total={line.total}

            />



          </React.Fragment>


        )

      )}


    </>

  );

}







function CashFlowRow({
  entry,
}:{
  entry:CashFlowEntry;
}) {


  return (

    <tr className="border-b border-gray-100 hover:bg-gray-50">


      <td className="px-10 py-3">


        <div className="text-gray-700">


          {entry.date}

          {" - "}

          {entry.description}


        </div>



        <div className="italic text-slate-500">


          {entry.cash_account}


        </div>



      </td>





      <td className="px-6 py-3 text-right">


        {formatAmount(entry.amount, entry.cash_out > 0)}


      </td>



      <td>

        -

      </td>



    </tr>

  );

}






function TotalRow({
  title,
  total,
}:{
  title:string;
  total:number;
}) {


  return (

    <tr className="bg-emerald-50">


      <td className="px-6 py-3 font-bold text-emerald-800">

        {title}

      </td>



      <td className="border-t-2 border-black">

      </td>



      <td className="px-6 py-3 text-right font-bold text-emerald-700">


        {formatAmount(total,total < 0)}


      </td>


    </tr>

  );

}






function GrandTotalRow({
  title,
  total,
}:{
  title:string;
  total:number;
}) {


  return (

    <tr className="bg-green-700 text-white">


      <td className="px-6 py-4 font-bold">

        {title}

      </td>



      <td>

        -

      </td>



      <td className="border-y-2 border-black px-6 py-4 text-right font-bold">


        {formatAmount(total,total < 0)}


      </td>


    </tr>

  );

}






function Spacer(){

  return (

    <tr>

      <td
        colSpan={3}
        className="h-5"
      />

    </tr>

  );

}

function EmptyRow({
  title,
}:{
  title:string;
}){


  return (

    <tr>


      <td
        colSpan={3}
        className="px-10 py-3 italic text-slate-500"
      >

        {title}

      </td>


    </tr>

  );

}





function BalanceRow({
  title,
  amount,
}:{
  title:string;
  amount:number;
}){


  return (

    <tr className="border-b border-gray-100">


      <td className="px-6 py-3 font-semibold">

        {title}

      </td>



      <td>

        -

      </td>



      <td className="px-6 py-3 text-right font-semibold">


        {formatAmount(
          amount,
          amount < 0
        )}


      </td>



    </tr>

  );

}




function formatAmount(
  amount:number,
  negative:boolean
){


  if(negative){

    return (
      `(${Math.abs(amount).toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      })})`
    );

  }


  return amount.toLocaleString(undefined,{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });


}

