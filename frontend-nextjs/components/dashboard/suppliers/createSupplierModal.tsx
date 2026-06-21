"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import { createSupplier } from "@/app/actions/supplier-actions";
import { useAuthStore } from "@/stores/authStore";

import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";

export default function CreateSupplierModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);
  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await createSupplier(currentOrg?.id || "", formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Supplier created");
        setOptions(res.select_options);
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

        <div className="sticky top-0 z-10 bg-white">
          <ModalHeader
            title="Create Supplier"
            description="Add a new supplier"
            onClose={onClose}
          />
        </div>

        <div className="overflow-y-auto px-5 py-6">
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm">

            <form key={resetKey} action={handleSubmit} className="space-y-6">

              <Input
                label="Name"
                name="name"
                icon={<FiUser />}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                icon={<FiMail />}
              />

              <Input
                label="Phone number"
                name="phone_number"
                type="text"
                required
                icon={<FiPhone />}
              />

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Creating..." : "Create Supplier"}
              </Button>

            </form>

          </div>
        </div>
      </div>
    </Modal>
  );
}