"use client";

import { useServiceIncome } from "@/hooks/useServiceIncome";
import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import { groupEntries } from "@/lib/utils";
import { ServiceIncome } from "@/types";
import PurchaseSalesAccountField, { Entry } from "../purchases/PurchaseSalesAccountField";
import ServiceIncomeEntries from "./ServiceIncomeEntries";
import PaymentAccountsField from "../purchases/PaymentAccountsField";
import DiscountAccountField from "../purchases/DiscountAccountField";
import BillInvoiveAccountField from "../purchases/BillInvoiceAccount";
import BalanceStatus from "../purchases/BalanceStatus";


type Props = {
    serviceIncome: ServiceIncome;
};

export default function EditServiceIncome({ serviceIncome }: Props) {

    const {
        currentOrg, difference, serviceIncome: editingServiceIncome, handleChange, updateEntry, addEntry, removeEntry, posting,
        addServiceIncomeEntry,
        handleUpdate,
        updateServiceIncomeEntry,
        removeServiceIncomeEntry,
        serviceIncomeAccounts,
        paymentAccounts,
        customersAccounts,
        expenseDiscountAccounts,
        services,
        serviceIncomeTotal,
        serialNumber,
        isDirty, hasChanges, isEditing, cancelEdit, enableEditing, isJournalTypeDirty
    } = useServiceIncome(serviceIncome);
    const grouped = groupEntries(editingServiceIncome.journal_entries);

    const invoiceDirty =
        isJournalTypeDirty("invoice") || isDirty('due_date');

    return (
        <form onSubmit={handleUpdate} className="max-w-7xl mx-auto space-y-6">

            <div className="bg-white rounded-3xl border shadow-sm p-6">
                <div className="flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-gray-800">
                            Record Service Income
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
                        value={editingServiceIncome.serial_number === "" ? serialNumber : serviceIncome.serial_number}
                        onChange={(val) => {
                            handleChange('serial_number', val);
                        }}
                    />


                    {/* DATE */}
                    <InputField
                        required
                        label="Date"
                        type="date"
                        value={editingServiceIncome.date}
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
                        value={editingServiceIncome.description}
                        onChange={(val) => {
                            handleChange('description', val);
                        }}
                        placeholder="Enter description"
                        isDirty={isDirty("description")}
                        disabled={!isEditing}
                    />


                    <PurchaseSalesAccountField
                        title="Service Income Account"
                        entryData={grouped.service_income as Entry}
                        accounts={serviceIncomeAccounts}
                        updateEntry={updateEntry}
                        isDirty={isJournalTypeDirty('service_income')}
                        disabled={!isEditing}
                    />
                </div>
            </div>


            {/* ITEMS */}
            <ServiceIncomeEntries
                serviceIncomeEntries={editingServiceIncome.service_income_entries}
                updateServiceIncomeEntry={updateServiceIncomeEntry}
                removeServiceIncomeEntry={removeServiceIncomeEntry}
                addServiceIncomeEntry={addServiceIncomeEntry}
                services={services}
                currency={currentOrg?.currency ?? 'Kshs'}
                isDirty={isDirty('service_income_entries')}
                disabled={!isEditing}
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
                    isDirty={isJournalTypeDirty('payment')}
                    disabled={!isEditing}
                />

                <BillInvoiveAccountField
                    entryData={grouped.invoice as Entry}
                    dueDate={editingServiceIncome.due_date}
                    changeDueDate={handleChange}
                    type="invoice"
                    accounts={customersAccounts}
                    debitCredit="debit"
                    updateEntry={updateEntry}
                    addEntry={addEntry}
                    removeEntry={removeEntry}
                    isDirty={invoiceDirty}
                    disabled={!isEditing}
                />

            </div>
            <DiscountAccountField
                entryData={grouped.discount as Entry}
                purchaseTotal={serviceIncomeTotal}
                accounts={expenseDiscountAccounts}
                debitCredit="debit"
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

                    {posting ? "Updating..." : "Update Income"}
                </button>

            </div>

        </form>
    );
}