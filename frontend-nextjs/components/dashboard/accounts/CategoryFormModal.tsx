"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Button from "@/components/forms/Button";


import {
  createAccountCategory,
  editCategory,
} from "@/app/actions/account-actions";

import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import InputField from "../journals/InputField";
import SelectField from "../journals/SelectField";
import { Category } from "@/types";

type CategoryPayload = {
  name: string;
  group: string;
};

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: Category | null;
};

export default function CategoryFormModal({
  open,
  onClose,
  mode,
  initialData,
}: CategoryFormModalProps) {
  const [pending, startTransition] = useTransition();

  const { currentOrg } = useAuthStore();
  const { fixed_groups, setOptions } = useSelectOptionsStore();

  const [form, setForm] = useState(initialData ?? {
    name: "",
    group: "",
  });


  function handleChange(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (pending) return;

  if (!form.name.trim()) {
    toast.error("Name is required");
    return;
  }

  startTransition(async () => {
    try {
      let res;

      if (mode === "create") {
        if (!form.group) {
          toast.error("Group required.");
          return;
        }

        const payload: CategoryPayload = {
          name: form.name,
          group: form.group,
        };

        res = await createAccountCategory(
          currentOrg?.id || "",
          payload
        );
      } else {
        const payload = {
          name: form.name,
        };

        res = await editCategory(
          currentOrg?.id || "",
          "categories",
          initialData?.id || "",
          payload
        );
      }

      if (!res?.success) {
        toast.error(res?.error || "Something went wrong");
        return;
      }

      toast.success(res.message || "Success");

      setOptions(res.select_options);
      onClose();
    } catch {
      toast.error("Something went wrong");
    }
  });
}

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md">
        <ModalHeader
          title={mode === "create" ? "Create Category" : "Edit Category"}
          description="Manage account categories"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <InputField
            label="Category Name"
            name="name"
            value={form.name}
            onChange={(val) => handleChange("name", val)}
            required
          />

          {mode === 'create' && <SelectField
            label="Account Group"
            name="group"
            value={form.group ?? ""}
            onChange={(val) => handleChange("group", val as string)}
            options={fixed_groups}
            required={mode === 'create'}
          />
}
          <Button type="submit" disabled={pending} className="w-full">
            {pending
              ? "Saving..."
              : mode === "create"
              ? "Create Category"
              : "Update Category"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}