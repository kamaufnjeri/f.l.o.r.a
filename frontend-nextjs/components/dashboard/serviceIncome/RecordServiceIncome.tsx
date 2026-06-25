"use client";

import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import BillInvoiveAccountField from "../purchases/BillInvoiceAccount";
import DiscountAccountField from "../purchases/DiscountAccountField";
import PaymentAccountsField from "../purchases/PaymentAccountsField";
import PurchaseSalesAccountField, { Entry } from "../purchases/PurchaseSalesAccountField";
import ServiceIncomeEntries from "./ServiceIncomeEntries";
import { useServiceIncome } from "@/hooks/useServiceIncome";
import { groupEntries } from "@/lib/utils";

export default function RecordServiceIncome() {
 
  const { 
    currentOrg, difference, serviceIncome, handleChange, updateEntry, addEntry, removeEntry, posting,
    addServiceIncomeEntry,
    handleSubmit,
    updateServiceIncomeEntry,
    removeServiceIncomeEntry,
    serviceIncomeAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    services,
    serviceIncomeTotal,
    serialNumber
  
  } = useServiceIncome();
  const grouped = groupEntries(serviceIncome.journal_entries);

  

 
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">

      <div className="bg-white rounded-3xl border shadow-sm p-6">
             <h1 className="text-lg font-semibold text-gray-800">
               Record Service Income
             </h1>
     
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DATE */}
                <InputField
                 required
                           label="Serial Number"
                           type="text"
                           
                           value={serviceIncome.serial_number === "" ? serialNumber : serviceIncome.serial_number}
                           onChange={(val) => {
                             handleChange('serial_number', val);
                           }}
                         />
               
     
               {/* DATE */}
                <InputField
                 required
                           label="Date"
                           type="date"
                           value={serviceIncome.date}
                           onChange={(val) => {
                             handleChange('date', val);
                           }}
                         />
               
                         {/* DESCRIPTION */}
                         <TextAreaField
                         required
                           label="Description"
                           value={serviceIncome.description}
                           onChange={(val) => {
                             handleChange('description', val);
                           }}
                           placeholder="Enter description"
                         />
     
               
               <PurchaseSalesAccountField
                title="Service Income Account"
                entryData={grouped.service_income as Entry}
                accounts={serviceIncomeAccounts}
                updateEntry={updateEntry}
              />
             </div>
           </div>
     
     
       {/* ITEMS */}
      <ServiceIncomeEntries
        serviceIncomeEntries={serviceIncome.service_income_entries}
        updateServiceIncomeEntry={updateServiceIncomeEntry}
        removeServiceIncomeEntry={removeServiceIncomeEntry}
        addServiceIncomeEntry={addServiceIncomeEntry}
        services={services}
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
          dueDate={serviceIncome.due_date}
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
          purchaseTotal={serviceIncomeTotal}
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
            Total Service Income
          </div>

          {/* RIGHT */}
          <div className="text-lg font-semibold text-gray-900">
            {serviceIncomeTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="text-sm">
          {difference === 0 ? (
            <span className="text-green-600 font-medium">
              ✓ Balanced
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              ✗ Not Balanced (Difference: {currentOrg?.currency || "Kshs"} {difference.toFixed(2)})
            </span>
          )}
        </div>

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

            {posting ? "Posting..." : "Post Service Income"}
            </button>

      </div>

    </form>
  );
}