"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createOrganization } from "@/app/actions/org-actions";
import Input from "@/components/forms/Input";
import Button from "@/components/forms/Button";
import {
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";


import { useAuthStore } from "@/stores/authStore";
function CreateOrgForm() {
 const router = useRouter();
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

      toast.success(res.message || "Organization created.");

      if (res.data) {
        const user = res.data;

        setUser(user);
        setCurrentOrg(user.current_organisation ?? null);
        setUserOrgs(user.user_organisations ?? []);

        if (user.current_organisation?.id) {
          router.push(`/dashboard/${user.current_organisation.id}`);
        }
      }

      setResetKey((prev) => prev + 1);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  });
}

return (
  <form
    key={resetKey}
    action={handleSubmit}
    className="
      space-y-6
      rounded-3xl
      bg-white/70 backdrop-blur-xl
      border border-white/60
      shadow-[0_10px_40px_rgba(0,0,0,0.06)]
      p-6 sm:p-8
    "
  >
    <div className="space-y-4">

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

      <Input
        label="Currency"
        name="currency"
        icon={<FiDollarSign />}
        placeholder="KES"
        required
      />

      <Button
        type="submit"
        disabled={pending}
        className="w-full"
      >
        {pending ? "Creating..." : "Create Organization"}
      </Button>

    </div>
  </form>
);

}

export default CreateOrgForm
