"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import {
  editService
} from "@/app/actions/service-actions";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";


export default function UpdateServiceModal({
  service,
  onClose,
}: {
  service: {
    id: string;
    name: string;
    description: string;
  }
  onClose: () => void;
}) {
  const [servicePending, startServiceTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();


  // ================= ACCOUNT =================
  async function handleSubmit(formData: FormData) {
    if (servicePending) return;

    startServiceTransition(async () => {
      try {
        const res = await editService(currentOrg?.id || "", service.id, formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Service created");

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
            title="Update Service"
            description="Change service info"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">

          {/* ================= ACCOUNT ================= */}
         

            <form
              key={`service-${resetKey}`}
              action={handleSubmit}
              className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >

                <Input label="Service name" name="name" required value={service.name}/>
                <Input label="Description" name="description" type="text" required value={service.description}/>
                <div className="flex h-10 self-center">
                   <Button type="submit" disabled={servicePending} className="w-full">
                {servicePending ? "Saving..." : "Save"}
              </Button>
                </div>
              
              

              
            </form>
          </div>
      </div>
    </Modal>
  );
}