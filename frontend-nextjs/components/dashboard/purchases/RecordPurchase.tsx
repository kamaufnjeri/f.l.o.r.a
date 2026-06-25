"use client";

import PurchaseSalesAccountField, { Entry } from "./PurchaseSalesAccountField";
import PaymentAccountsField from "./PaymentAccountsField";
import BillInvoiveAccountField from "./BillInvoiceAccount";
import DiscountAccountField from "./DiscountAccountField";
import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import PurchaseEntries from "./PurchaseEntries";
import { usePurchase } from "@/hooks/usePurchase";
import { groupEntries } from "@/lib/utils";

export default function RecordPurchase() {
 
  const { 
    currentOrg, difference, purchase, handleChange, updateEntry, addEntry, removeEntry, posting,
    addPurchaseEntry,
    handleSubmit,
    updatePurchaseEntry,
    removePurchaseEntry,
      purchaseAccounts,
    paymentAccounts,
    suppliersAccounts,
    incomeDiscountAccounts,
    stocks,
    purchaseTotal,
    serialNumber
  
  } = usePurchase();
  const grouped = groupEntries(purchase.journal_entries);

  

 
  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">

      <div className="bg-white rounded-3xl border shadow-sm p-6">
             <h1 className="text-lg font-semibold text-gray-800">
               Record Purchase
             </h1>
     
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DATE */}
                <InputField
                 required
                           label="Serial Number"
                           type="text"
                           
                           value={purchase.serial_number === "" ? serialNumber : purchase.serial_number}
                           onChange={(val) => {
                             handleChange('serial_number', val);
                           }}
                         />
               
     
               {/* DATE */}
                <InputField
                 required
                           label="Date"
                           type="date"
                           value={purchase.date}
                           onChange={(val) => {
                             handleChange('date', val);
                           }}
                         />
               
                         {/* DESCRIPTION */}
                         <TextAreaField
                         required
                           label="Description"
                           value={purchase.description}
                           onChange={(val) => {
                             handleChange('description', val);
                           }}
                           placeholder="Enter description"
                         />
     
               
               <PurchaseSalesAccountField
                title="Purchase Account"
                entryData={grouped.purchase as Entry}
                accounts={purchaseAccounts}
                updateEntry={updateEntry}
              />
             </div>
           </div>
     
     
       {/* ITEMS */}
      <PurchaseEntries
        purchaseEntries={purchase.purchase_entries}
        updatePurchaseEntry={updatePurchaseEntry}
        removePurchaseEntry={removePurchaseEntry}
        addPurchaseEntry={addPurchaseEntry}
        stocks={stocks}
        currency={currentOrg?.currency ?? 'Kshs'}
      />

      {/* BILL + DISCOUNT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaymentAccountsField
          entriesData={grouped.payment as Entry[]}
          accounts={paymentAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

        <BillInvoiveAccountField
          entryData={grouped.bill}
          dueDate={purchase.due_date}
          changeDueDate={handleChange}
          type="bill"
          accounts={suppliersAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      </div>
       <DiscountAccountField
          entryData={grouped.discount}
          purchaseTotal={purchaseTotal}
          accounts={incomeDiscountAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      
      {/* FOOTER */}
      <div className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm sticky bottom-3">

        <div className="flex items-center justify-between gap-4 bg-gray-100 p-4 rounded-lg">
          {/* LEFT */}
          <div className="text-sm font-medium text-gray-700">
            Total Purchases
          </div>

          {/* RIGHT */}
          <div className="text-lg font-semibold text-gray-900">
            {purchaseTotal.toLocaleString(undefined, {
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

            {posting ? "Posting..." : "Post Purchase"}
            </button>

      </div>

    </form>
  );
}