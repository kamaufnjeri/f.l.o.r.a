"use client";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import Button from "@/components/forms/Button";
import Input from "@/components/forms/Input";

import { usePayment } from "@/hooks/usePayment";
import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  type: "debit" | "credit";
  billId?: string | null;
  invoiceId?: string | null;
  onSuccess?: () => void;
};

export default function RecordPaymentModal({
  open,
  onClose,
  title = "Record Payment",
  type,
  billId,
  invoiceId,
  onSuccess,
}: Props) {
  const {
    payment,
    paymentAccounts,
    difference,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    handleSubmit,
    posting,
  } = usePayment(type, {
    bill: billId ?? null,
    invoice: invoiceId ?? null,
  });

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col">
        <ModalHeader
          title={title}
          description="Record a payment transaction"
          onClose={onClose}
        />

        <form
          onSubmit={async (e) => {
            await handleSubmit(e);

            if (difference === 0) {
              onSuccess?.();
              onClose();
            }
          }}
          className="flex flex-col gap-6 overflow-y-auto p-6"
        >
          {/* HEADER */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
          
                    {/* DATE */}
                    <InputField
                    required
                      label="Date"
                      type="date"
                      value={payment.date}
                      onChange={(val) => {
                        handleChange('date', val);
                      }}
                    />
          
                    {/* DESCRIPTION */}
                    <TextAreaField
                    required
                      label="Description"
                      value={payment.description}
                      onChange={(val) => {
                        handleChange('description', val);
                      }}
                      placeholder="Enter journal description"
                    />
                  </div>

          {/* ACCOUNTS */}
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                Payment Accounts
              </h3>

              <Button
                type="button"
                onClick={addEntry}
                size="sm"
              >
                Add Account
              </Button>
            </div>

            <div className="space-y-3">
              {payment.journal_entries.map(
                (entry, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-12"
                  >
                    <div className="md:col-span-6">
                      <select
                        value={entry.account}
                        onChange={(e) =>
                          updateEntry(
                            index,
                            "account",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border p-3"
                      >
                        <option value="">
                          Select Account
                        </option>

                        {paymentAccounts.map(
                          (account) => (
                            <option
                              key={account.value}
                              value={account.value}
                            >
                              {account.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <Input
                        type="number"
                        value={entry.amount}
                        onChange={(e) =>
                          updateEntry(
                            index,
                            "amount",
                            Number(
                              e.target.value
                            )
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex h-full items-center rounded-xl border bg-slate-100 px-3">
                        {entry.debit_credit}
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() =>
                          removeEntry(index)
                        }
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* BALANCE */}
          <div
            className={`rounded-xl p-4 text-center font-semibold ${
              difference === 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            Difference: {difference}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={posting || difference !== 0}
            >
              {posting
                ? "Recording..."
                : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}