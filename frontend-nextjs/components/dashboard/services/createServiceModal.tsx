"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import { createService } from "@/app/actions/service-actions";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";

import { FiFileText, FiInfo } from "react-icons/fi";
import Textarea from "@/components/forms/Textarea";

type Props = {
  onClose: () => void;
};

export default function CreateServiceModal({ onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { setOptions } = useSelectOptionsStore(); // assuming you have it
  const { currentOrg } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await createService(currentOrg?.id || "", formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Service created");
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

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white">
          <ModalHeader
            title="Create Service"
            description="Add a new service to your organisation"
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

                {/* NAME */}
                <Input
                  label="Service name"
                  name="name"
                  icon={<FiFileText />}
                  required
                />

                {/* DESCRIPTION */}
                <div className="sm:col-span-2">
                  <Textarea
                    label="Description"
                    name="description"
                    icon={<FiInfo />}
                    required
                  />
                </div>

              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={pending}
                className="w-full"
              >
                {pending ? "Creating..." : "Create Service"}
              </Button>

            </form>

          </div>
        </div>
      </div>
    </Modal>
  );
}