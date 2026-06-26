"use client";

import { PurchaseEntry } from "@/types";
import { FaPlus, FaTrash } from "react-icons/fa";
import SelectField, { SelectOption } from "../journals/SelectField";
import InputField from "../journals/InputField";

type Props = {
  purchaseEntries: PurchaseEntry[];
  stocks: SelectOption[];
  addPurchaseEntry: () => void;
  updatePurchaseEntry: <
    K extends keyof PurchaseEntry
  >(
    index: number,
    field: K,
    value: PurchaseEntry[K]
  ) => void;
  removePurchaseEntry: (index: number) => void;
  disabled?: boolean;
  isDirty?: boolean;
  currency: string;
};

export default function PurchaseEntries({
  purchaseEntries,
  currency = "Kshs",
  addPurchaseEntry,
  updatePurchaseEntry,
  removePurchaseEntry,
  stocks,
  disabled = false,
  isDirty,
}: Props) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Purchase Items
          </h2>

          {isDirty && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              edited
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={addPurchaseEntry}
          disabled={disabled}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 transition"
        >
          <FaPlus className="text-sm" />
          Add Item
        </button>
      </div>

      {/* TABLE HEADER (DESKTOP) */}
      <div className="hidden md:grid grid-cols-12 text-xs font-medium text-gray-500 border-b pb-2">
        <div className="col-span-5">Stock</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-3 text-center">
          Price ({currency})
        </div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* ROWS */}
      <div className="space-y-3">
        {purchaseEntries.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 transition"
          >
            {/* STOCK */}
            <div className="md:col-span-5">
              <SelectField
                value={item.stock || ""}
                options={stocks}
                onChange={(val) =>
                  updatePurchaseEntry(index, "stock", val)
                }
                disabled={disabled}
              />
            </div>

            {/* QTY */}
            <div className="md:col-span-2">
              <InputField
                type="number"
                value={item.purchased_quantity}
                onChange={(val) =>
                  updatePurchaseEntry(
                    index,
                    "purchased_quantity",
                    Number(val)
                  )
                }
                disabled={disabled}
              />
            </div>

            {/* PRICE */}
            <div className="md:col-span-3">
              <InputField
                type="number"
                value={item.purchase_price}
                onChange={(val) =>
                  updatePurchaseEntry(
                    index,
                    "purchase_price",
                    Number(val)
                  )
                }
                disabled={disabled}
              />
            </div>

            {/* ACTION */}
            <div className="md:col-span-2 flex md:justify-end justify-start">
              {(!disabled && purchaseEntries.length > 1) && (
                <button
                  type="button"
                            disabled={disabled}

                  onClick={() => removePurchaseEntry(index)}
                  className="flex cursor-pointer items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition"
                >
                  <FaTrash className="text-sm" />
                  <span className="text-sm md:hidden">Remove</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}