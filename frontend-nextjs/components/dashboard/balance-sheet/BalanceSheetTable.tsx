"use client";

import React, { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { Account, BalanceSheetResponse } from "./types";
import { formatAmount } from "@/lib/utils";

type Props = {
  organisationId: string;
  data: BalanceSheetResponse;
  showDetails: boolean;
  setShowDetails: Dispatch<SetStateAction<boolean>>;
};

export default function BalanceSheetTable({
  organisationId,
  data,
  showDetails,
  setShowDetails,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="min-w-full border-collapse text-sm">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <thead className="bg-slate-800 text-white">

            <tr>

              <th className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 text-left font-semibold">

                <span>Description</span>

                <label className="flex cursor-pointer items-center gap-2">

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

            {/* ================================================= */}
            {/* ASSETS */}
            {/* ================================================= */}

            <SectionHeader title="Assets" />

            {/* ================================================= */}
            {/* NON CURRENT ASSETS */}
            {/* ================================================= */}

            <SubHeader title="Non-Current Assets" />

            {Object.entries(data.assets.non_current).map(
              ([subCategory, accounts]) => (
                <React.Fragment key={subCategory}>

                  <SubCategoryHeader title={subCategory} />

                  {showDetails &&
                    accounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                        name={account.name}
                        amount={account.amount}
                      />
                    ))}

                </React.Fragment>
              )
            )}

            <TotalRow
              title="Total Non-Current Assets (A)"
              total={data.assets.total_non_current}
            />

            <Spacer />

            {/* ================================================= */}
            {/* CURRENT ASSETS */}
            {/* ================================================= */}

            <SubHeader title="Current Assets" />

            {Object.entries(data.assets.current).map(
              ([subCategory, accounts]) => {

                if (subCategory === "Inventory") return null;

                return (

                  <React.Fragment key={subCategory}>

                    <SubCategoryHeader title={subCategory} />

                    {showDetails &&
                      (accounts as Account[]).map((account) => (

                        <AccountRow
                          key={account.id}
                          goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                          name={account.name}
                          amount={account.amount}
                        />

                      ))}

                  </React.Fragment>

                );
              }
            )}
                        {/* ================================================= */}
            {/* INVENTORY */}
            {/* ================================================= */}

            {data.assets.current.Inventory && (
              <>
                <SubCategoryHeader title="Inventory" />

                {showDetails &&
                  data.assets.current.Inventory.stocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-10 py-2 italic text-gray-700 flex flex-wrap gap-3 justify-between">
                        <span>{stock.name} → {stock.quantity} @ {stock.rate}</span>
                        <span>={" "}={" "}</span>
                        <span>{formatAmount(stock.amount)}</span>
                         <Link
                          href={`/dashboard/${organisationId}/stocks/${stock.id}`}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50"
                        >
                          <FiEye />
                          View
                        </Link>
                      </td>

                      <td className="text-right">-</td>

                      <td></td>
                    </tr>
                  ))}

                <AmountRow
                  title="Closing Stock - Opening Stock"
                  amount={0}
                  color="gray"
                />

                <tr className="bg-amber-50">

                  <td className="px-10 py-3 font-medium text-slate-700">
                    {formatAmount(data.assets.current.Inventory.closing_stock)}
                    {" - ("}
                    {formatAmount(data.assets.current.Inventory.opening_stock)}
                    {")"}
                  </td>

                  <td className="px-6 py-3 text-right font-semibold">
                    {formatAmount(data.assets.current.Inventory.inventory)}
                  </td>

                  <td></td>

                </tr>
              </>
            )}

            {/* ================================================= */}
            {/* TOTAL CURRENT ASSETS */}
            {/* ================================================= */}

            <TotalRow
              title="Total Current Assets (B)"
              total={data.assets.total_current}
            />

            <GrandTotalRow
              title="Total Assets (A + B)"
              total={data.assets.total}
            />

            <Spacer />

            {/* ================================================= */}
            {/* LIABILITIES */}
            {/* ================================================= */}

            <SectionHeader title="Liabilities" />

            {/* ================================================= */}
            {/* NON-CURRENT LIABILITIES */}
            {/* ================================================= */}

            <SubHeader title="Non-Current Liabilities" />
                        {Object.entries(data.liabilities.non_current).map(
              ([subCategory, accounts]) => (
                <React.Fragment key={subCategory}>

                  <SubCategoryHeader title={subCategory} />

                  {showDetails &&
                    accounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                        name={account.name}
                        amount={account.amount}
                      />
                    ))}

                </React.Fragment>
              )
            )}

            <TotalRow
              title="Total Non-Current Liabilities (C)"
              total={data.liabilities.total_non_current}
            />

            <Spacer />

            {/* ================================================= */}
            {/* CURRENT LIABILITIES */}
            {/* ================================================= */}

            <SubHeader title="Current Liabilities" />

            {Object.entries(data.liabilities.current).map(
              ([subCategory, accounts]) => (
                <React.Fragment key={subCategory}>

                  <SubCategoryHeader title={subCategory} />

                  {showDetails &&
                    accounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                        name={account.name}
                        amount={account.amount}
                      />
                    ))}

                </React.Fragment>
              )
            )}

            <TotalRow
              title="Total Current Liabilities (D)"
              total={data.liabilities.total_current}
            />

            <SubGrandTotalRow
              title="Total Liabilities E = (C + D)"
              total={data.liabilities.total}

            />

            <Spacer />

            {/* ================================================= */}
            {/* FINANCED BY */}
            {/* ================================================= */}

            <SectionHeader title="Financed By" />

            {/* ================================================= */}
            {/* CAPITAL */}
            {/* ================================================= */}

            <SubHeader title="Capital" />
                        {Object.entries(data.capital.owner_equity).map(
              ([subCategory, accounts]) => (
                <React.Fragment key={subCategory}>

                  <SubCategoryHeader title={subCategory} />

                  {showDetails &&
                    accounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        goToUrl={`/dashboard/${organisationId}/accounts/${account.id}`}
                        name={account.name}
                        amount={account.amount}
                      />
                    ))}

                </React.Fragment>
              )
            )}

            {/* ================================================= */}
            {/* RETAINED EARNINGS */}
            {/* ================================================= */}

            <SubHeader title="Retained Earnings" />

            <AccountRow
              goToUrl="#"
              name="Current Year Profit"
              amount={data.capital.retained_earnings.amount}
              hideView
            />

            <SubGrandTotalRow
              title="Total Capital (F)"
              total={data.capital.total}
              border="middle"
            />

            <Spacer />
          


          </tbody>

          {/* ================================================= */}
          {/* FOOTER TOTAL */}
          {/* ================================================= */}

          <tfoot>

            <tr className="bg-green-700 text-lg font-bold text-white">

              <td className="px-6 py-5">
                Total Liabilities &amp; Capital (E + F)
              </td>

              <td></td>

              <td className="border-y-2 border-black px-6 py-5 text-right">
                {formatAmount(data.liabilities.total + data.capital.total)}
              </td>

            </tr>
  {data.totals.balanced ? (

<tr className="bg-green-100 text-green-800 font-bold">


  <td
    colSpan={3}
    className="px-6 py-3"
  >

    ✓ Balance Sheet balances

  </td>


</tr>


) : (


<tr className="bg-red-100 text-red-800 font-bold">


  <td
    colSpan={3}
    className="px-6 py-3"
  >

    ✗ Balance Sheet does not balance

  </td>


</tr>


)}
          </tfoot>

        </table>

      </div>

    </div>

  );

}

/* ================================================= */
/* HELPERS */
/* ================================================= */

function SectionHeader({ title }: { title: string }) {
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

function SubHeader({ title }: { title: string }) {
  return (
    <tr className="bg-slate-200">
      <td
        colSpan={3}
        className="px-6 py-2 font-semibold text-slate-700"
      >
        {title}
      </td>
    </tr>
  );
}

function SubCategoryHeader({ title }: { title: string }) {
  return (
    <tr className="bg-slate-50">
      <td
        colSpan={3}
        className="px-6 py-2 font-semibold text-blue-900"
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
  hideView = false,
}: {
  goToUrl: string;
  name: string;
  amount: number;
  hideView?: boolean;
}) {
  return (
    <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50">

      <td className="flex flex-wrap items-center justify-between gap-4 px-10 py-2 italic text-gray-700">

        <span>{name}</span>

        {!hideView && (
          <Link
            href={goToUrl}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-indigo-600 hover:bg-indigo-50"
          >
            <FiEye />
            View
          </Link>
        )}

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
  color,
}: {
  title: string;
  amount: number;
  color: "gray" | "yellow" | "blue";
}) {
  const colors = {
    gray: "bg-slate-100",
    yellow: "bg-amber-50",
    blue: "bg-sky-50",
  };

  return (
    <tr className={colors[color]}>

      <td className="px-6 py-3 font-semibold text-slate-700">
        {title}
      </td>

      <td className="px-6 py-3 text-right font-semibold">
        {formatAmount(amount)}
      </td>

      <td></td>

    </tr>
  );
}

function TotalRow({
  title,
  total,
}: {
  title: string;
  total: number;
}) {
  return (
    <tr className="bg-emerald-50">

      <td className="px-6 py-3 font-bold text-emerald-800">
        {title}
      </td>

      <td className="border-t-2 border-black"></td>

      <td className="px-6 py-3 text-right font-bold text-emerald-700">
        {formatAmount(total)}
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
    <tr className="bg-green-700 text-white">

      <td className="px-6 py-4 text-base font-bold">
        {title}
      </td>

      <td></td>

      <td className="border-y-2 border-black px-6 py-4 text-right text-base font-bold">
        {formatAmount(total)}
      </td>

    </tr>
  );
}

function SubGrandTotalRow({
  title,
  total,
  border = "last",
}: {
  title: string;
  total: number;
  border?: "middle" | "last";
}) {
  return (
    <tr className="bg-green-100">

      <td className="px-6 py-4 text-base font-bold text-green-900">
        {title}
      </td>

      <td
        className={`${
          border === "middle" ? "border-t-2 border-black" : ""
        }`}
      ></td>

      <td
        className={`px-6 py-4 text-right text-base font-bold text-green-800 ${
          border === "last" ? "border-t-2 border-black" : ""
        }`}
      >
        {formatAmount(total)}
      </td>

    </tr>
  );
}