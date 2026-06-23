"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import {
  editCustomer
} from "@/app/actions/customer-actions";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";


export default function UpdateCustomerModal({
  customer,
  onClose,
}: {
  customer: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
  }
  onClose: () => void;
}) {
  const [customerPending, startCustomerTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const { setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();


  // ================= ACCOUNT =================
  async function handleSubmit(formData: FormData) {
    if (customerPending) return;

    startCustomerTransition(async () => {
      try {
        const res = await editCustomer(currentOrg?.id || "", customer.id, formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        }

        toast.success(res.message || "Customer created");

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
            title="Update Customer"
            description="Change customer info"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">

          {/* ================= ACCOUNT ================= */}
         

            <form
              key={`customer-${resetKey}`}
              action={handleSubmit}
              className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >

                <Input label="Customer name" name="name" required value={customer.name}/>
                <Input label="Customer email" name="email" type="email" required value={customer.email}/>
                <Input label="Customer phone no." name="phone_number" required value={customer.phone_number}/>

               <div className="flex h-10 self-center">
                   <Button type="submit" disabled={customerPending} className="w-full">
                {customerPending ? "Saving..." : "Save"}
              </Button>
                </div>
              
            

              
            </form>
          </div>
      </div>
    </Modal>
  );
}