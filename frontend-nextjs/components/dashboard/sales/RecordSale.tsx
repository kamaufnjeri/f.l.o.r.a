"use client";

import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import BalanceStatus from "../purchases/BalanceStatus";
import BillInvoiveAccountField from "../purchases/BillInvoiceAccount";
import DiscountAccountField from "../purchases/DiscountAccountField";
import PaymentAccountsField from "../purchases/PaymentAccountsField";
import PurchaseSalesAccountField, { Entry } from "../purchases/PurchaseSalesAccountField";
import SaleEntries from "./SaleEntries";
import { useSale } from "@/hooks/useSale";
import { groupEntries } from "@/lib/utils";

export default function RecordSale() {
 
  const { 
    currentOrg, difference, sale, handleChange, updateEntry, addEntry, removeEntry, posting,
    addSaleEntry,
    handleSubmit,
    updateSaleEntry,
    removeSaleEntry,
    salesAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    stocks,
    saleTotal,
    serialNumber
  
  } = useSale();
  const grouped = groupEntries(sale.journal_entries);

  

 
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">

      <div className="bg-white rounded-3xl border shadow-sm p-6">
             <h1 className="text-lg font-semibold text-gray-800">
               Record Sale
             </h1>
     
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DATE */}
                <InputField
                 required
                           label="Serial Number"
                           type="text"
                           
                           value={sale.serial_number === "" ? serialNumber : sale.serial_number}
                           onChange={(val) => {
                             handleChange('serial_number', val);
                           }}
                         />
               
     
               {/* DATE */}
                <InputField
                 required
                           label="Date"
                           type="date"
                           value={sale.date}
                           onChange={(val) => {
                             handleChange('date', val);
                           }}
                         />
               
                         {/* DESCRIPTION */}
                         <TextAreaField
                         required
                           label="Description"
                           value={sale.description}
                           onChange={(val) => {
                             handleChange('description', val);
                           }}
                           placeholder="Enter description"
                         />
     
               
               <PurchaseSalesAccountField
                title="Sales Account"
                entryData={grouped.sales as Entry}
                accounts={salesAccounts}
                updateEntry={updateEntry}
              />
             </div>
           </div>
     
     
       {/* ITEMS */}
      <SaleEntries
        saleEntries={sale.sales_entries}
        updateSaleEntry={updateSaleEntry}
        removeSaleEntry={removeSaleEntry}
        addSaleEntry={addSaleEntry}
        stocks={stocks}
        currency={currentOrg?.currency ?? 'Kshs'}
      />

      {/* BILL + DISCOUNT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaymentAccountsField
          entriesData={grouped.payment as Entry[]}
          accounts={paymentAccounts}
          debitCredit="debit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

        <BillInvoiveAccountField
          entryData={grouped.invoice}
          dueDate={sale.due_date}
          changeDueDate={handleChange}
          type="invoice"
          accounts={customersAccounts}
          debitCredit="debit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      </div>
       <DiscountAccountField
          entryData={grouped.discount}
          purchaseTotal={saleTotal}
          accounts={expenseDiscountAccounts}
          debitCredit="debit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      
      {/* FOOTER */}
      <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm sticky bottom-3">

        <div className="flex items-center justify-between gap-4 bg-gray-100 p-4 rounded-lg">
          {/* LEFT */}
          <div className="text-sm font-medium text-gray-700">
            Total Sales
          </div>

          {/* RIGHT */}
          <div className="text-lg font-semibold text-gray-900">
            {saleTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
                        <BalanceStatus currency={currentOrg?.currency} difference={difference}/>
        

        {/* SUBMIT */}
        <button
            type="submit"
            disabled={difference !== 0 || posting}
            className={`
                px-5 py-2 cursor-pointer rounded-lg text-white text-sm transition flex items-center gap-2
                ${
                difference === 0 && !posting
                    ? "bg-black hover:bg-gray-800"
                    : "bg-gray-300 cursor-not-allowed"
                }
            `}
            >
            {posting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}

            {posting ? "Posting..." : "Post Sale"}
            </button>

      </div>

    </form>
  );
}