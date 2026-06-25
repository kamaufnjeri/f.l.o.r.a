"use client";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import { usePayment } from "@/hooks/usePayment";

import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import SelectField from "../journals/SelectField";

import { FaPlus, FaTrash } from "react-icons/fa";
import { PaymentFormData } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  editing?: boolean;
  debitCreditType: "debit" | "credit";
  billId?: string | null;
  invoiceId?: string | null;
  revalidateUrl?: string | null;
  updatePayment?: PaymentFormData;
};

export default function PaymentModal({
  open,
  onClose,
  title,
  editing = false,
  debitCreditType,
  revalidateUrl,
  billId,
  invoiceId,
  updatePayment
}: Props) {
  const {
    payment,
    paymentAccounts,
    totalAmount,
    currentOrg,
    handleChange,
    hasChanges,
    updateEntry,
    addEntry,
    removeEntry,
    handleSubmit,
    handleUpdate,
    posting,
    isEditing,
    enableEditing,
    cancelEdit,
    entriesLength,
    isDirty
  } = usePayment(debitCreditType, revalidateUrl,  {
    bill: billId ?? null,
    invoice: invoiceId ?? null,
    ...updatePayment
  });

  if (!open) return null;

  const paymentTitle =
    title ??
    (editing ? "Update Payment" : "Record Payment");

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white">
        <ModalHeader
          title={paymentTitle}
          description="Manage payment details and account allocations."
          onClose={onClose}
        />

        <form
          onSubmit={(e) => {
            if (editing && isEditing) {
              handleUpdate(e);
            } else {
              handleSubmit(e);
            }
          }}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* SUMMARY */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Payment {currentOrg?.currency}
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-slate-900">
                    {totalAmount.toLocaleString()} 
                  </h2>
                   <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {entriesLength} account{entriesLength !== 1 ? "s" : ""}
                </p>
                </div>

                  
                  {/* RIGHT: ACTIONS */}
                 {editing && 
                  <div className="flex flex-col gap-2 items-center">
                 
                    {/* EDIT / VIEW TOGGLE */}
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => enableEditing()}
                        className="px-4 py-2  cursor-pointer  text-sm bg-black text-white rounded-lg hover:bg-gray-800"
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
                        <div className="mt-3 text-sm">
          {hasChanges ? (
            <span className="text-yellow-600 font-medium">
              ⚠ Unsaved changes
            </span>
          ) : (
            <span className="text-gray-400">No changes</span>
          )}
        </div>
                  </div>}
                 
                
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Payment Details
                </h3>

                <p className="text-sm text-slate-500">
                  Basic information about this payment.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  required
                  label="Payment Date"
                  type="date"
                  value={payment.date}
                  onChange={(val) => {
                    handleChange('date', val);
                  }}
                  disabled={editing ? !isEditing : undefined}
                  isDirty={editing ? isDirty("date"): undefined}
                />

                <TextAreaField
                  required
                  label="Description"
                  value={payment.description}
                  onChange={(val) => {
                    handleChange('description', val);
                  }}
                  disabled={editing ? !isEditing : undefined}
                  isDirty={editing ? isDirty("description"): undefined}
                />
              </div>
            </div>

            {/* ACCOUNTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment Accounts
                  </h3>

                  <p className="text-sm text-slate-500">
                    Allocate payment amounts to accounts.
                  </p>

                </div>
                                  {isDirty('journal_entries') && <span className="text-yellow-500 text-xs">• edited</span>}

                <button
                  type="button"
                  onClick={addEntry}
                  disabled={editing ? !isEditing : false}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-black hover:bg-slate-50"
                >
                  <FaPlus className="text-xs" />
                  Add Account
                </button>

              </div>
<div className="space-y-3">
  <div className="grid grid-cols-12 gap-4 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
    <div className="col-span-5">Account</div>
    <div className="col-span-2">Type</div>
    <div className="col-span-4">Amount</div>
    <div className="col-span-1"></div>
  </div>

  {payment.journal_entries.map((entry, index) => {
    const isEditable = entry.debit_credit === debitCreditType;

    return (
      <div
        key={index}
        className={`grid grid-cols-12 gap-4 rounded-xl border p-4 ${
          isEditable
            ? "border-slate-200 bg-slate-50/60"
            : "border-slate-100 bg-slate-50"
        }`}
      >
        <div className="col-span-5">
          {isEditable ? (
            <SelectField
              value={entry.account}
              options={paymentAccounts}
              onChange={(val) =>
                updateEntry(index, "account", val as string)
              }
              disabled={editing ? !isEditing : undefined}
            />
          ) : (
            <span className="text-sm text-slate-700">
              {entry.account_name}
            </span>
          )}
        </div>

        <div className="col-span-2 flex items-center">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              entry.debit_credit === "debit"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {entry.debit_credit}
          </span>
        </div>

        <div className="col-span-4">
          {isEditable ? (
            <InputField
              type="number"
              value={entry.amount}
              onChange={(val) =>
                updateEntry(index, "amount", Number(val))
              }
              disabled={editing ? !isEditing : undefined}
            />
          ) : (
            <span className="text-sm font-medium text-slate-700">
              {Number(entry.amount).toLocaleString()}
            </span>
          )}
        </div>

        <div className="col-span-1 flex items-center justify-end">
          {isEditable && (
            <button
              type="button"
              disabled={entriesLength <= 1}
              onClick={() => removeEntry(index)}
              className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:text-red-300"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Total Allocated
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Total Payment Amount
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={(posting || (isEditing && !hasChanges) ? true : false)}
                  className={`flex min-w-[170px] disabled:bg-slate-600 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition ${
                    posting
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-black hover:bg-slate-800"
                  }`}
                >
                  {posting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}

                  {posting
                    ? editing
                      ? "Updating..."
                      : "Posting..."
                    : editing
                    ? "Update Payment"
                    : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}