"use client";

import React, { Dispatch, SetStateAction } from "react";
import { IncomeStatementResponse } from "./types";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { formatAmount } from "@/lib/utils";

type Props = {
  organisationId: string;
  data: IncomeStatementResponse;
  showDetails: boolean;
  setShowDetails: Dispatch<SetStateAction<boolean>>
};

export default function IncomeStatementTable({
  organisationId,
  data,
  showDetails,
  setShowDetails
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">

          {/* ================= HEADER ================= */}

          <thead className="bg-slate-800 text-white">
            <tr>
              <th className=" px-6 py-4 text-left font-semibold flex flex-wrap items-center justify-between gap-4">
                <span>Description</span>
                <label className="
flex
items-center
gap-2
cursor-pointer
">


                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                  />


                  Show Details


                </label>

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

            {/* ========================================================= */}
            {/* REVENUE */}
            {/* ========================================================= */}

            <SectionHeader title="Revenue" />

            <SubHeader title="Product Sales" />

            {showDetails &&
              data.sales.accounts.map((account) => (
                <AccountRow
                  goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                  key={account.id}
                  name={account.name}
                  amount={account.amount}
                />
              ))}

            <AmountRow
              title="Total Sales (A)"
              amount={data.sales.total}
              color="blue"
              borderTop={true}
            />

            <AmountRow
              title="Less: Sales Returns (B)"
              amount={data.sales_return.amount}
              negative
              color="yellow"
            />

            <TotalRow
              title="Net Sales (A - B)"
              total={data.net_sales}
            />

            <Spacer />

            {/* ========================================================= */}
            {/* COST OF GOODS SOLD */}
            {/* ========================================================= */}

            <SectionHeader title="Cost of Goods Sold" />

            <AmountRow
              title="Opening Stock (A)"
              amount={data.opening_stock.amount}
              color="gray"
            />

            <SubHeader title="Purchases" />

            {showDetails &&
              data.purchases.accounts.map((account) => (
                <AccountRow
                  goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}

                  key={account.id}
                  name={account.name}
                  amount={account.amount}
                />
              ))}

            <AmountRow
              title="Total Purchases (B)"
              amount={data.purchases.total}
              color="blue"
              borderTop={true}
            />

            <AmountRow
              title="Less: Purchase Returns (C)"
              amount={data.purchase_return.amount}
              negative
              color="yellow"
            />

            <AmountRow
              title="Goods Available for Sale (D = A + B - C)"
              amount={data.goods_available_for_sale}
              color="gray"
              borderTop={true}
            />

            <SubHeader title="Closing Stock" />

            {showDetails &&
              data.closing_stock.stocks.map((stock) => (
                <AccountRow
                  goToUrl={`/dashboard/${organisationId}/stocks/${stock.id}`}

                  key={stock.id}
                  name={`${stock.name} -> ${stock.quantity} @ ${stock.rate}`}
                  amount={stock.amount}
                />
              ))}

            <AmountRow
              title="Less: Closing Stock (E)"
              amount={data.closing_stock.amount}
              negative
              color="yellow"
            />

            <TotalRow
              title="Cost of Goods Sold (D - E)"
              total={data.cost_of_goods_sold}
              less={true}
            />

            <GrandTotalRow
              title="Gross Profit"
              total={data.gross_profit}
            />
            <Spacer />

            {/* ========================================================= */}
            {/* SERVICE INCOME */}
            {/* ========================================================= */}

            {data.service_income.total > 0 && (
              <>
                <SectionHeader title="Service Income" />

                {showDetails &&
                  data.service_income.accounts.map((account) => (
                    <AccountRow
                      goToUrl={`/accounts/${account.id}`}
                      key={account.id}
                      name={account.name}
                      amount={account.amount}
                    />
                  ))}

                <TotalRow
                  title="Total Service Income"
                  total={data.service_income.total}
                />

                <Spacer />
              </>
            )}

            {/* ========================================================= */}
            {/* OTHER INCOME */}
            {/* ========================================================= */}

            {data.other_income.total > 0 && (
              <>
                {Object.entries(data.other_income.categories).map(
                  ([categoryName, category]) => (
                    <React.Fragment key={categoryName}>
                      <SectionHeader title={categoryName} />

                      {Object.entries(category.sub_categories).map(
                        ([subCategoryName, subCategory]) => (
                          <React.Fragment key={subCategoryName}>
                            <SubHeader title={subCategoryName} />

                            {showDetails &&
                              subCategory.accounts.map((account) => (
                                <AccountRow
                                  goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}

                                  key={account.id}
                                  name={account.name}
                                  amount={account.amount}
                                />
                              ))}
                          </React.Fragment>
                        )
                      )}

                      <AmountRow
                        title={`Total ${categoryName}`}
                        amount={category.total}
                        color="gray"
                        borderTop={true}
                      />

                    </React.Fragment>
                  )
                )}

                <TotalRow
                  title="Total"
                  total={data.other_income.total}

                />

                <Spacer />
              </>
            )}

            {/* ========================================================= */}
            {/* TOTAL REVENUE */}
            {/* ========================================================= */}

            <GrandTotalRow
              title="Total Revenue"
              total={data.total_revenue}
            />

            <Spacer />
            {/* ========================================================= */}
            {/* OPERATING EXPENSES */}
            {/* ========================================================= */}

            {data.expenses.total > 0 && (
              <>
                {Object.entries(data.expenses.categories).map(
                  ([categoryName, category]) => (
                    <React.Fragment key={categoryName}>
                      <SectionHeader title={categoryName} />

                      {Object.entries(category.sub_categories).map(
                        ([subCategoryName, subCategory]) => (
                          <React.Fragment key={subCategoryName}>
                            <SubHeader title={subCategoryName} />

                            {showDetails &&
                              subCategory.accounts.map((account) => (
                                <AccountRow
                                  goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}

                                  key={account.id}
                                  name={account.name}
                                  amount={account.amount}
                                />
                              ))}
                          </React.Fragment>
                        )
                      )}

                      <AmountRow
                        title={`Total ${categoryName}`}
                        amount={category.total}
                        color="gray"
                        borderTop={true}

                      />

                    </React.Fragment>
                  )
                )}

                <TotalRow
                  title="Total"
                  total={data.expenses.total}
                  less={true}
                />

                <Spacer />
              </>
            )}

          </tbody>

          {/* ========================================================= */}
          {/* FOOT TOTALS */}
          {/* ========================================================= */}

          <tfoot>

            <tr className="bg-green-700 text-white text-lg font-bold">

              <td className="px-6 py-5">
                Net Profit
              </td>

              <td></td>

              <td className="border-y-2 border-black px-6 py-5 text-right">
                {data.net_profit < 0
                  ? `(${Math.abs(data.net_profit).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})`
                  : data.net_profit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </td>

            </tr>

          </tfoot>

        </table>
      </div>
    </div>
  );
}

/* ========================================================= */
/* HELPERS */
/* ========================================================= */

function SectionHeader({ title }: { title: string }) {
  return (
    <tr className="bg-slate-600 text-white">
      <td colSpan={3} className="px-6 py-3 text-sm font-bold tracking-wide uppercase">
        {title}
      </td>
    </tr>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <tr className="bg-slate-100">
      <td
        colSpan={3}
        className="px-6 py-2 font-semibold text-slate-700"
      >
        {title}
      </td>
    </tr>
  );
}

function Spacer() {
  return (
    <tr>
      <td colSpan={3} className="h-4 bg-white"></td>
    </tr>
  );
}

function AccountRow({
  goToUrl,
  name,
  amount,
}: {
  goToUrl: string;
  name: string;
  amount: number;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-10 py-2 text-gray-700 italic flex flex-wrap items-center justify-between gap-4">
        <span>{name}</span>
        <Link
          href={goToUrl}
          className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                px-3
                py-1.5
                text-indigo-600
                hover:bg-indigo-50
              "
        >
          <FiEye />

          View

        </Link>

      </td>

      <td className="px-6 py-2 text-right">
        {formatAmount(amount)}
      </td>

      <td></td>
    </tr>
  );
}

function AmountRow({
  title,
  amount,
  negative,
  color,
  borderTop = false
}: {
  title: string;
  amount: number;
  negative?: boolean;
  color: "blue" | "yellow" | "gray";
  borderTop?: boolean
}) {

  const colors = {
    blue: "bg-sky-50",
    yellow: "bg-amber-50",
    gray: "bg-slate-100",
  };

  return (
    <tr className={`${colors[color]} `}>

      <td className="px-6 py-3 font-semibold text-slate-700">
        {title}
      </td>

      <td className={`${borderTop ? "border-t-2 border-black" : ""} px-6 py-3 text-right font-semibold`}>
        {negative
          ? `(${formatAmount(amount)})`
          : formatAmount(amount)}
      </td>

      <td></td>

    </tr>
  );
}

function TotalRow({
  title,
  total,
  less = false
}: {
  title: string;
  total: number;
  less?: boolean;
}) {
  return (
    <tr className="bg-emerald-50 ">
      <td className="px-6 py-3 font-bold text-emerald-800 ">
        {title}
      </td>

      <td className="border-t-2 border-black"></td>

      <td className=" px-6 py-3 text-right font-bold text-emerald-700 ">
        {less ? `(${formatAmount(total)})` : formatAmount(total)}
      </td>
    </tr>
  );
}

function GrandTotalRow({
  title,
  total,
}: {
  title: string;
  total: number;
}) {
  return (
    <tr className="bg-green-100">
      <td className="px-6 py-4 text-base font-bold text-green-900">
        {title}
      </td>

      <td></td>

      <td className="border-t-2 border-black px-6 py-4 text-right text-base font-bold text-green-800">
        {formatAmount(total)}
      </td>
    </tr>
  );
}