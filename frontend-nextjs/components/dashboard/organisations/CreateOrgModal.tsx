"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createOrganization } from "@/app/actions/org-actions";
import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import { useAuthStore } from "@/stores/authStore";

import {
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

export default function CreateOrgModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  const {
    setUser,
    setUserOrgs,
    setCurrentOrg,
  } = useAuthStore();

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {

        const res = await createOrganization(formData);

        if (!res.success) {
          toast.error(res.error || "Something went wrong.");
          return;
        }

        toast.success(
          res.message || "Organization created."
        );

        // if your action returns the created org
        if (res.data) {
          const user = res.data;
          setUser(user);
          setCurrentOrg(user.current_organisation ?? null);
          setUserOrgs(user.user_organisations ?? []);
        }


        setResetKey((prev) => prev + 1);

        onClose();
      } catch (error) {
        console.error(error);

        toast.error(
          "Something went wrong. Please try again."
        );
      }
    });
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">

        <div className="sticky top-0 z-10 bg-white">
          <ModalHeader
            title="Create Organization"
            description="Set up your workspace to continue"
            onClose={onClose}
          />
        </div>

        <div className="overflow-y-auto px-5 py-6">
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm">

            <form
              key={resetKey}
              action={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Input
                  label="Organization name"
                  name="org_name"
                  icon={<FiGlobe />}
                  required
                />

                <Input
                  label="Organization email"
                  name="org_email"
                  type="email"
                  icon={<FiMail />}
                  required
                />

                <Input
                  label="Phone number"
                  name="org_phone_number"
                  icon={<FiPhone />}
                  placeholder="+254700000000"
                  required
                />

                <Input
                  label="Country"
                  name="country"
                  icon={<FiMapPin />}
                  required
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Currency"
                    name="currency"
                    icon={<FiDollarSign />}
                    placeholder="KES"
                    required
                  />
                </div>

              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full"
              >
                {pending
                  ? "Creating..."
                  : "Create Organization"}
              </Button>
            </form>

          </div>
        </div>

      </div>
    </Modal>
  );
}