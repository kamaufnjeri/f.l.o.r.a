"use client";

import { useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/forms/Button";

import {
  createAccountSubCategory,
  editCategory,
} from "@/app/actions/account-actions";

import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { SubCategory } from "@/types";
import InputField from "../journals/InputField";
import SelectField from "../journals/SelectField";


type SubCategoryPayload = {
  name: string;
  category: string;
};

type SubCategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialData?: SubCategory | null;
};

export default function SubCategoryFormModal({
  open,
  onClose,
  mode,
  initialData,
}: SubCategoryFormModalProps) {
  const [pending, startTransition] = useTransition();

  const { currentOrg } = useAuthStore();
  const { categories, setOptions } = useSelectOptionsStore();

  const [form, setForm] = useState(initialData ?? {
    name: "",
    category: "",
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
        if (!form.category) {
          toast.error("Category required.");
          return;
        }

        const payload: SubCategoryPayload = {
          name: form.name,
          category: form.category,
        };

        res = await createAccountSubCategory(
          currentOrg?.id || "",
          payload
        );
      } else {
        const payload = {
          name: form.name,
        };

        res = await editCategory(
          currentOrg?.id || "",
          "sub-categories",
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
          title={
            mode === "create"
              ? "Create Sub Category"
              : "Edit Sub Category"
          }
          description="Manage account sub categories"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <InputField
            label="Sub Category Name"
            name="name"
            value={form.name}
            onChange={(val) => handleChange("name", val)}
            required
          />

          {mode === 'create' && <SelectField
            label="Parent Category"
            name="category"
            value={form.category ?? ""}
            onChange={(val) => handleChange("category", val as string)}
            options={categories}
            required={mode === 'create'}
          />}

          <Button type="submit" disabled={pending} className="w-full">
            {pending
              ? "Saving..."
              : mode === "create"
              ? "Create Sub Category"
              : "Update Sub Category"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}