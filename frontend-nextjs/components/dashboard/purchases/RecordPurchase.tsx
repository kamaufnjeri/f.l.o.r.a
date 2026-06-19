"use client";

import { useAccountingForm } from "@/hooks/useAccountingForm";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import PurchaseSalesAccountField from "./PurchaseSalesAccountField";
import PaymentAccountsField from "./PaymentAccountsField";
import BillInvoiveAccountField from "./BillInvoiceAccount";
import DiscountAccountField from "./DiscountAccountField";
import { usePurchaseItem } from "@/hooks/usePurchaseItem";
import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import PurchaseEntries from "./PurchaseEntries";
import { useAuthStore } from "@/stores/authStore";
import { useMemo, useState } from "react";
import { recordPurchase } from "@/app/actions/purchase-actions";
import toast from "react-hot-toast";
import { JournalEntry } from "@/types";

export default function RecordPurchase() {
  const [posting, setPosting] = useState(false);
  const {
    serial_numbers,
    purchaseAccounts,
    paymentAccounts,
    suppliersAccounts,
    incomeDiscountAccounts,
    stocks,
    setSerialNumbers,
  } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  const { form, addEntry, updateEntry, removeEntry, setForm } = useAccountingForm();

  const {
    date,
    setDate,
    dueDate,
    setDueDate,
    description,
    setDescription,
    purchaseEntries,
    setPurchaseEntries,
    updatePurchaseEntry,
    removePurchaseEntry,
    addPurchaseEntry,
  } = usePurchaseItem();

 

   // 🧮 balance check
  const purchaseTotal = useMemo(() => {
  return purchaseEntries.reduce((amount, entry) => {
    const quantity = Number(entry.purchased_quantity || 0);
    const price = Number(entry.purchase_price || 0);

    return amount + (quantity * price);
  }, 0);
}, [purchaseEntries]);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    updateEntry('purchase', 'amount', purchaseTotal);

    const payload = {
      serial_number: serial_numbers.journal,
      date,
      description,
      due_date: dueDate,
      journal_entries: [
        form?.bill,
        form?.discount,
        form?.purchase,
        ...form?.payment,
      ].filter(Boolean) as JournalEntry[],      
      purchase_entries: purchaseEntries
    };

    console.log(payload);

    try {
    const res = await recordPurchase(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Journal entry created");
    setDate("");
    setDescription("");
    setDueDate("")
    setForm({
      purchase: { account: "", debit_credit: 'debit', amount: 0.0, type: 'purchase'},
      sale: { account: "", debit_credit: 'credit', amount: 0.0, type: 'sale'},
      bill: null,
      invoice: null,
      discount: null,
      payment: [],
    })
    setPurchaseEntries([{ stock: null, purchased_quantity: 0, purchase_price: 0.0 }]
    );

    // OPTIONAL: update store if backend returns updated accounts
    if (res.serial_numbers) {
        setSerialNumbers(res.serial_numbers);
    }

    
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
             <h1 className="text-lg font-semibold text-gray-800">
               Record Purchase
             </h1>
     
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* SERIAL */}
               <div>
                 <label className="text-xs text-gray-500">
                   Serial Number
                 </label>
                 <div className="px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-700">
                   {serial_numbers.purchase}
                 </div>
               </div>
     
               {/* DATE */}
               <InputField
                 label="Date"
                 type="date"
                 value={date}
                 onChange={setDate}
               />
     
               {/* DESCRIPTION */}
               <TextAreaField
                 label="Description"
                 value={description}
                 onChange={setDescription}
                 placeholder="Enter purchase description"
               />
               <PurchaseSalesAccountField
                title="Purchase Account"
                entry={form.purchase}
                accounts={purchaseAccounts}
                type="purchase"
                updateEntry={updateEntry}
              />
             </div>
           </div>
     
     
       {/* ITEMS */}
      <PurchaseEntries
        purchaseEntries={purchaseEntries}
        updatePurchaseEntry={updatePurchaseEntry}
        removePurchaseEntry={removePurchaseEntry}
        addPurchaseEntry={addPurchaseEntry}
        stocks={stocks}
        currency={currentOrg?.currency ?? 'Kshs'}
      />

      {/* BILL + DISCOUNT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PaymentAccountsField
          entries={form.payment}
          accounts={paymentAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

        <BillInvoiveAccountField
          entry={form.bill}
          dueDate={dueDate}
          setDueDate={setDueDate}
          type="bill"
          accounts={suppliersAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      </div>
       <DiscountAccountField
          entry={form.discount}
          purchaseTotal={purchaseTotal}
          accounts={incomeDiscountAccounts}
          debitCredit="credit"
          updateEntry={updateEntry}
          addEntry={addEntry}
          removeEntry={removeEntry}
        />

      
      {/* FOOTER */}
      <div className="flex w-full justify-between gap-3 sticky bottom-4 bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-4">

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

        <button
            type="submit"
            disabled={posting}
            className={`
                px-5 py-2 cursor-pointer rounded-lg text-white text-sm transition flex items-center gap-2
                ${
                !posting
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