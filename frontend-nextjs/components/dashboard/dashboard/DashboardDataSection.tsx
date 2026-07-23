import DashboardCard from "./DashboardCard";
import QuickStatsCard from "./QuickStatsCard";
import RecentTransactions from "./RecentTransactions";
import { DashboardData } from "./types";
import QuickActionsCard from "./QuickActionsCard";
import InventoryOverviewCard from "./InventoryOverviewCard";
import IncomeExpenseCard from "./IncomeExpenseCard";
import FinancialCard from "./FinancialCard";



type Props = {
  organisationId: string;
  data: DashboardData;
};


export default function DashboardDataSection({
  organisationId,
  data,
}: Props) {


  const {
    summary,
    income_expense,
    quick_stats,
    recent_transactions,
  } = data;


  return (

    <div className="space-y-6">


    {/* ===============================
    FINANCIAL POSITION
================================ */}

<div
  className="
    rounded-2xl
    border
    border-gray-100
    bg-white
    shadow-sm
    p-5
  "
>

  {/* HEADER */}


    <div>
      <h2
        className="
          text-base
          font-semibold
          text-primary
        "
      >
        Financial Position
      </h2>

      <p
        className="
          text-sm
          text-gray-500
          mt-1
        "
      >
        Overview of assets, liabilities and profitability
      </p>
    </div>


    <div
 className="
  grid
  grid-cols-1
  sm:grid-cols-2
  xl:grid-cols-4
  gap-4
 "
>


<FinancialCard
 title="Cash"
 value={summary.cash}
 tone='green'
 description="Available cash and bank balances"
 actions={[
   {
    label:"Cash Flow",
    href:`/dashboard/${organisationId}/reports/cash-flow`
   }
 ]}
/>



<FinancialCard
 title="Receivables"
 value={summary.receivables}
 description="Money owed by customers"
 tone='blue'
 actions={[
   {
    label:"Customers",
    href:`/dashboard/${organisationId}/customers`
   },
   {
    label:"Invoices",
    href:`/dashboard/${organisationId}/invoices`
   }
 ]}
/>



<FinancialCard
 title="Payables"
 value={summary.payables}
 description="Bills owed to suppliers"
 tone='red'
 actions={[
   {
    label:"Suppliers",
    href:`/dashboard/${organisationId}/suppliers`
   },
   {
    label:"Bills",
    href:`/dashboard/${organisationId}/bills`
   }
 ]}
/>



<FinancialCard
 title="Net Profit"
 value={summary.profit}
 description="Current period profitability"
 tone='purple'
 actions={[
   {
    label:"Income Statement",
    href:`/dashboard/${organisationId}/reports/income-statement`
   }
 ]}
/>


</div>


</div>





      {/* ===============================
          QUICK ACTIONS
      =============================== */}


      


          <QuickActionsCard
            organisationId={organisationId}
          />


      








      {/* ===============================
          INVENTORY + INCOME
      =============================== */}


      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        <InventoryOverviewCard inventory={summary.inventory} organisationId={organisationId}/>
        <IncomeExpenseCard data={income_expense} organisationId={organisationId}/>
      </div>







      {/* ===============================
          RECENT TRANSACTIONS
      =============================== */}


      <RecentTransactions
       organisationId={organisationId}
        transactions={recent_transactions}
      />





      {/* ===============================
          QUICK STATS
      =============================== */}

            <QuickStatsCard stats={quick_stats} organisationId={organisationId}/>
  



    </div>

  );
}
