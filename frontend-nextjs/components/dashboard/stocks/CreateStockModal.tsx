"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import { createStock } from "@/app/actions/stock-actions";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";

import { FiLayers, FiPackage, FiTag, FiHash, FiDollarSign } from "react-icons/fi";

export default function CreateStockModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { addStock } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await createStock(currentOrg?.id || "", formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Stock created");

        if (res.stock) {
          addStock(res.stock);
        }

        setResetKey((p) => p + 1);
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again");
      }
    });
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white">
          <ModalHeader
            title="Create Stock"
            description="Add a new stock item to your organisation"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6">
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm">

            <form
              key={resetKey}
              action={handleSubmit}
              className="space-y-6"
            >
              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* STOCK NAME */}
                <Input
                  label="Stock name"
                  name="name"
                  icon={<FiLayers />}
                  required
                />

                {/* UNIT NAME */}
                <Input
                  label="Unit name"
                  name="unit_name"
                  icon={<FiPackage />}
                  required
                />

                {/* UNIT ALIAS */}
                <Input
                  label="Unit alias"
                  name="unit_alias"
                  icon={<FiTag />}
                  required
                />

                {/* OPENING STOCK QUANTITY */}
                <Input
                  label="Opening stock quantity"
                  name="opening_stock_quantity"
                  type="number"
                  icon={<FiHash />}
                  placeholder="0"
                  required
                />

                {/* OPENING STOCK RATE */}
                <Input
                  label="Opening stock rate"
                  name="opening_stock_rate"
                  type="number"
                  icon={<FiDollarSign />}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={pending}
                className="w-full"
              >
                {pending ? "Creating..." : "Create Stock"}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </Modal>
  );
}