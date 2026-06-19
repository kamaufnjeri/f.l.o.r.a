"use client";

import { PurchaseEntry } from "@/types";
import { FaPlus, FaTrash } from "react-icons/fa";
import SelectField, { SelectOption } from "../journals/SelectField";
import InputField from "../journals/InputField";

type Props = {
  purchaseEntries: PurchaseEntry[];
  stocks: SelectOption[];
  addPurchaseEntry: () => void;
  updatePurchaseEntry: (
    index: number,
    field: keyof PurchaseEntry,
    value: string | number
  ) => void;
  removePurchaseEntry: (index: number) => void;
  disabled?: boolean;
  isDirty?: boolean;
  onMarkDirty?: () => void;
  currency: string;
};

export default function PurchaseEntries({
  purchaseEntries,
  currency = 'Kshs',
  addPurchaseEntry,
  updatePurchaseEntry,
  removePurchaseEntry,
  stocks,
  disabled = false,
  isDirty,
  onMarkDirty,
}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Purchase Items
        </h2>
        {isDirty && <span className="text-yellow-500 text-xs">• edited</span>}

        <button
          type="button"
          onClick={() => {
            addPurchaseEntry();
            onMarkDirty?.();
          }}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-800 transition"
        >
          <FaPlus />
          Add Item
        </button>
      </div>

      <div className="space-y-4">

        {purchaseEntries.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end"
          >

            <div className="lg:col-span-5">
              <SelectField
                label="Stock"
                value={item.stock || ""}
                options={stocks}
                onChange={(val) => {
                  updatePurchaseEntry(index, "stock", val);
                  onMarkDirty?.();
                }}
                disabled={disabled}
              />
            </div>

            <div className="lg:col-span-3">
              <InputField
                label="Qty"
                type="number"
                value={item.purchased_quantity}
                onChange={(val) => {
                  updatePurchaseEntry(index, "purchased_quantity", Number(val));
                  onMarkDirty?.();
                }}
                disabled={disabled}
              />
            </div>

            <div className="lg:col-span-3">
              <InputField
                label={`Price (${currency})`}
                type="number"
                value={item.purchase_price}
                onChange={(val) => {
                  updatePurchaseEntry(index, "purchase_price", Number(val));
                  onMarkDirty?.();
                }}
                disabled={disabled}
              />
            </div>

            <div className="lg:col-span-1 flex justify-end">
              {!disabled && (
                <button
                  type="button"
                  onClick={() => {
                    removePurchaseEntry(index);
                    onMarkDirty?.();
                  }}
                  className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
                >
                  <FaTrash />
                </button>
              )}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}