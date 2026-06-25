"use client";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import { useReturn } from "@/hooks/useReturn";

import InputField from "../journals/InputField";
import TextAreaField from "../journals/TextAreaField";
import SelectField from "../journals/SelectField";

import { FaPlus, FaTrash } from "react-icons/fa";
import { ReturnEntry, ReturnFormData } from "@/types/returns";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  editing?: boolean;
  stocks: { id: string, name: string }[];
  type: "sales" | "purchases";
  salesId?: string | null;
  purchaseId?: string | null;
  revalidateUrl?: string | null;
  updateReturn?: ReturnFormData;
};

export default function ReturnModal({
  open,
  onClose,
  title,
  editing = false,
  stocks,
  type,
  revalidateUrl,
  salesId,
  purchaseId,
  updateReturn
}: Props) {
  const {
    returnItem,
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
  } = useReturn(type, revalidateUrl, {
    sales: salesId ?? null,
    purchase: purchaseId ?? null,
    return_entries: updateReturn?.return_entries as ReturnEntry[] ?? [{ return_quantity: 0, purchase_entry: "", sales_entry: "" }],
    ...updateReturn
  });

  if (!open) return null;

  const returnTitle =
    title ??
    (editing ? `Update ${type} return` : `Record ${type} return` );

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white">
        <ModalHeader
          title={returnTitle}
          description="Manage return details and account allocations."
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
                    Return entries
                  </p>


                  <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {entriesLength} {entriesLength > 1 ? "entries" : "entry"}
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
                  Return Details
                </h3>

                <p className="text-sm text-slate-500">
                  Basic information about this return.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  required
                  label="Return Date"
                  type="date"
                  value={returnItem.date}
                  onChange={(val) => {
                    handleChange('date', val);
                  }}
                  disabled={editing ? !isEditing : undefined}
                  isDirty={editing ? isDirty("date") : undefined}
                />

                <TextAreaField
                  required
                  label="Description"
                  value={returnItem.description}
                  onChange={(val) => {
                    handleChange('description', val);
                  }}
                  disabled={editing ? !isEditing : undefined}
                  isDirty={editing ? isDirty("description") : undefined}
                />
              </div>
            </div>

            {/* ACCOUNTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Return Stocks
                  </h3>

                  <p className="text-sm text-slate-500">
                    Allocate return amounts to accounts.
                  </p>

                </div>
                {isDirty('return_entries') && <span className="text-yellow-500 text-xs">• edited</span>}

                <button
                  type="button"
                  onClick={addEntry}
                  disabled={editing ? !isEditing : false}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-black hover:bg-slate-50"
                >
                  <FaPlus className="text-xs" />
                  Add Entry
                </button>

              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <div className="col-span-5">Stock</div>
                  <div className="col-span-4">Return Qty</div>
                  <div className="col-span-1"></div>
                </div>

                {returnItem.return_entries.map((entry, index) => {

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-12 gap-4 rounded-xl border p-4 border-slate-200 bg-slate-50/60"border-slate-100 bg-slate-50`}
                    >
                      <div className="col-span-5">
                        {type === "purchases" ? (
                          <SelectField
                            value={entry?.purchase_entry ?? ""}
                            options={stocks}
                            onChange={(val) =>
                              updateEntry(index, "purchase_entry", val as string)
                            }
                            disabled={editing ? !isEditing : undefined}
                          />
                        ) : <SelectField
                          value={entry?.sales_entry ?? ""}
                          options={stocks}
                          onChange={(val) =>
                            updateEntry(index, "sales_entry", val as string)
                          }
                          disabled={editing ? !isEditing : undefined}
                        />}
                      </div>


                      <div className="col-span-4">
                          <InputField
                            type="number"
                            value={entry.return_quantity}
                            onChange={(val) =>
                              updateEntry(index, "return_quantity", Number(val))
                            }
                            disabled={editing ? !isEditing : undefined}
                          />
                        
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            disabled={entriesLength <= 1}
                            onClick={() => removeEntry(index)}
                            className="flex cursor-pointer h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:text-red-300"
                          >
                            <FaTrash />
                          </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-6 backdrop-blur-md">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center justify-end">
             

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
                  disabled={(posting || (isEditing && !hasChanges )? true : false)}
                  className={`flex min-w-[170px] disabled:bg-slate-600 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition ${posting
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
                      ? "Update Return"
                      : "Record Return"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}