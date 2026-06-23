"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import {
  editStock
} from "@/app/actions/stock-actions";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";


export default function UpdateStockModal({
  stock,
  onClose,
}: {
  stock: {
    id: string;
    name: string;
    unit_name: string;
    unit_alias: string;
  }
  onClose: () => void;
}) {
  const [stockPending, startStockTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();


  // ================= ACCOUNT =================
  async function handleSubmit(formData: FormData) {
    if (stockPending) return;

    startStockTransition(async () => {
      try {
        const res = await editStock(currentOrg?.id || "", stock.id, formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Stock created");

        setOptions(res.select_options);
        setResetKey((p) => p + 1);
        onClose();
      } catch {
        toast.error("Something went wrong. Please try again");
      }
    });
  }

  
  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-3xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <ModalHeader
            title="Update Stock"
            description="Change stock info"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">

          {/* ================= ACCOUNT ================= */}
         

            <form
              key={`stock-${resetKey}`}
              action={handleSubmit}
              className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >

                <Input label="Stock name" name="name" required value={stock.name}/>
                <Input label="Unit name" name="unit_name" type="text" required value={stock.unit_name}/>
                <Input label="Unit alias" name="unit_alias" required value={stock.unit_alias}/>
                <div className="flex h-10 self-center">
                   <Button type="submit" disabled={stockPending} className="w-full">
                {stockPending ? "Saving..." : "Save"}
              </Button>
                </div>
              
              

              
            </form>
          </div>
      </div>
    </Modal>
  );
}