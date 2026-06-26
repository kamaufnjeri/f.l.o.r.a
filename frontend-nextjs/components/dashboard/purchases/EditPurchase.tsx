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
import { Purchase } from "@/types";
import BalanceStatus from "./BalanceStatus";


type Props = {
    purchase: Purchase;
};

export default function EditPurchase({ purchase }: Props) {

    const {
        currentOrg, difference, purchase: editingPurchase, handleChange, updateEntry, addEntry, removeEntry, posting,
        addPurchaseEntry,
        handleUpdate,
        updatePurchaseEntry,
        removePurchaseEntry,
        purchaseAccounts,
        paymentAccounts,
        suppliersAccounts,
        incomeDiscountAccounts,
        stocks,
        purchaseTotal,
        serialNumber,
        isDirty, hasChanges, isEditing, cancelEdit, enableEditing, isJournalTypeDirty
    } = usePurchase(purchase);
    const grouped = groupEntries(editingPurchase.journal_entries);

    const billDirty =
        isJournalTypeDirty("bill");
    console.log(grouped);

    return (
        <form onSubmit={handleUpdate} className="max-w-7xl mx-auto space-y-6">

            <div className="bg-white rounded-3xl border shadow-sm p-6">
                <div className="flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-gray-800">
                            Update Purchase
                        </h1>

                        <div className="text-sm mt-1">
                            {hasChanges ? (
                                <span className="text-yellow-600 font-medium">
                                    ⚠ Unsaved changes
                                </span>
                            ) : (
                                <span className="text-gray-400">
                                    No changes
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex gap-2 items-center">

                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={enableEditing}
                                className="px-4 py-2 cursor-pointer text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                            >
                                Edit Mode
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-4 py-2 cursor-pointer text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                View Mode
                            </button>
                        )}

                    </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DATE */}
                    <InputField
                        required
                        label="Serial Number"
                        type="text"
                        isDirty={isDirty("serial_number")}
                        disabled={!isEditing}
                        value={editingPurchase.serial_number === "" ? serialNumber : purchase.serial_number}
                        onChange={(val) => {
                            handleChange('serial_number', val);
                        }}
                    />


                    {/* DATE */}
                    <InputField
                        required
                        label="Date"
                        type="date"
                        value={editingPurchase.date}
                        onChange={(val) => {
                            handleChange('date', val);
                        }}
                        isDirty={isDirty("date")}
                        disabled={!isEditing}

                    />

                    {/* DESCRIPTION */}
                    <TextAreaField
                        required
                        label="Description"
                        value={editingPurchase.description}
                        onChange={(val) => {
                            handleChange('description', val);
                        }}
                        placeholder="Enter description"
                        isDirty={isDirty("description")}
                        disabled={!isEditing}
                    />


                    <PurchaseSalesAccountField
                        title="Purchase Account"
                        entryData={grouped.purchase as Entry}
                        accounts={purchaseAccounts}
                        updateEntry={updateEntry}
                        isDirty={isJournalTypeDirty('purchase')}
                        disabled={!isEditing}
                    />
                </div>
            </div>


            {/* ITEMS */}
            <PurchaseEntries
                purchaseEntries={editingPurchase.purchase_entries}
                updatePurchaseEntry={updatePurchaseEntry}
                removePurchaseEntry={removePurchaseEntry}
                addPurchaseEntry={addPurchaseEntry}
                stocks={stocks}
                currency={currentOrg?.currency ?? 'Kshs'}
                isDirty={isDirty('purchase_entries')}
                disabled={!isEditing}
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
                    isDirty={isJournalTypeDirty('payment')}
                    disabled={!isEditing}
                />

                <BillInvoiveAccountField
                    entryData={grouped.bill as Entry}
                    dueDate={editingPurchase.due_date}
                    changeDueDate={handleChange}
                    type="bill"
                    accounts={suppliersAccounts}
                    debitCredit="credit"
                    updateEntry={updateEntry}
                    addEntry={addEntry}
                    removeEntry={removeEntry}
                    isDirty={billDirty}
                    disabled={!isEditing}
                />

            </div>
            <DiscountAccountField
                entryData={grouped.discount as Entry}
                purchaseTotal={purchaseTotal}
                accounts={incomeDiscountAccounts}
                debitCredit="credit"
                updateEntry={updateEntry}
                addEntry={addEntry}
                removeEntry={removeEntry}
                isDirty={isJournalTypeDirty('discount')}
                disabled={!isEditing}
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
                <BalanceStatus currency={currentOrg?.currency} difference={difference}/>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={enableEditing}
                        className="px-4 py-2 cursor-pointer text-sm bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        Edit
                    </button>
                )}

                {isEditing && (
                    <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 cursor-pointer text-sm bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                )}

                {/* SUBMIT */}
                <button
                    type="submit"
                    disabled={difference !== 0 || posting || !hasChanges}
                    className={`
                px-5 py-2 cursor-pointer rounded-lg text-white text-sm transition flex items-center gap-2
                ${difference === 0 && !posting && hasChanges
                            ? "bg-black hover:bg-gray-800"
                            : "bg-gray-300 cursor-not-allowed"
                        }
            `}
                >
                    {posting && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}

                    {posting ? "Updating..." : "Update Purchase"}
                </button>

            </div>

        </form>
    );
}