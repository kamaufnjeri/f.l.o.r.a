"use client";

import FormWrapper from "@/components/forms/FormWrapper";
import Input from "@/components/forms/Input";
import { FiGlobe, FiMail, FiPhone, FiMapPin, FiDollarSign } from "react-icons/fi";
import { createOrganization } from "@/app/actions/org-actions";

export default function OrganizationCreateForm() {
  return (
    <div className="rounded-3xl bg-white border shadow-xl p-8">
      
      <h1 className="text-2xl font-bold text-center">
        Create your organization
      </h1>

      <p className="text-center text-sm text-gray-500 mt-2 mb-6">
        Set up your workspace to continue
      </p>

      <FormWrapper
        action={createOrganization}
        buttonLabel="Create Organization"
        buttonLoadingLabel="Creating..."
      >
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
          placeholder="e.g +254700000000"
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
          placeholder="e.g kshs"
          required
        />
      </FormWrapper>
    </div>
  );
}