"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/forms/Button";

import { createAccount } from "@/app/actions/account-actions";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";

import {
  FiLayers,
  FiFolder,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";

export default function CreateAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { sub_categories, addAccount } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await createAccount(currentOrg?.id || "", formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Account created");

        // OPTIONAL: update store if backend returns updated accounts
        if (res.account) {
          addAccount(res.account);
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
            title="Create Account"
            description="Add a new ledger account to your organisation"
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

                {/* ACCOUNT NAME */}
                <Input
                  label="Account name"
                  name="name"
                  icon={<FiLayers />}
                  required
                />

                {/* SUB CATEGORY */}
                <Select
                  label="Belongs to"
                  name="belongs_to"
                  icon={<FiFolder />}
                  required
                  options={sub_categories}
                />

                {/* OPENING BALANCE */}
                <Input
                  label="Opening balance"
                  name="opening_balance"
                  type="number"
                  icon={<FiDollarSign />}
                  placeholder="0.00"
                />

                {/* TYPE */}
                <Select
                  label="Balance type"
                  name="opening_balance_type"
                  icon={<FiTrendingUp />}
                  options={[
                    { name: "Debit", id: "debit" },
                    { name: "Credit", id: "credit" },
                  ]}
                />
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={pending}
                className="w-full"
              >
                {pending ? "Creating..." : "Create Account"}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </Modal>
  );
}