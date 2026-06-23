"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import {
  editAccount
} from "@/app/actions/account-actions";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";

import {
  FiLayers,

} from "react-icons/fi";

export default function UpdateAccountModal({
  account,
  onClose,
}: {
  account: {
    id: string;
    name: string;
  }
  onClose: () => void;
}) {
  const [accountPending, startAccountTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();


  // ================= ACCOUNT =================
  async function handleSubmit(formData: FormData) {
    if (accountPending) return;

    startAccountTransition(async () => {
      try {
        const res = await editAccount(currentOrg?.id || "", account.id, formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Account created");

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
            title="Update Account"
            description="Change account name"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">

          {/* ================= ACCOUNT ================= */}
         

            <form
              key={`account-${resetKey}`}
              action={handleSubmit}
              className="space-y-6 flex flex-row items-center justify-between gap-4"
            >

                <Input label="Account name" name="name" required value={account.name}/>
               <Button type="submit" disabled={accountPending} className="w-full">
                {accountPending ? "Saving..." : "Save"}
              </Button>
              

              
            </form>
          </div>
      </div>
    </Modal>
  );
}