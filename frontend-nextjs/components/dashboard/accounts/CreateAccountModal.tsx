"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import Button from "@/components/forms/Button";

import {
  createAccount,
  createAccountCategory,
  createAccountSubCategory,
} from "@/app/actions/account-actions";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";

import {
  FiLayers,
  FiFolder,
  FiPlus,
  FiX,
} from "react-icons/fi";

export default function CreateAccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [accountPending, startAccountTransition] = useTransition();
  const [categoryPending, startCategoryTransition] = useTransition();
  const [subCategoryPending, startSubCategoryTransition] = useTransition();

  const [resetKey, setResetKey] = useState(0);

  const { sub_categories, categories, fixed_groups, setOptions } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();

  const [showCategory, setShowCategory] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState(false);

  // ================= ACCOUNT =================
  async function handleSubmit(formData: FormData) {
    if (accountPending) return;

    startAccountTransition(async () => {
      try {
        const res = await createAccount(currentOrg?.id || "", formData);

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

  // ================= CATEGORY =================
  async function handleCategorySubmit(formData: FormData) {
    if (categoryPending) return;

    startCategoryTransition(async () => {
      try {
        const res = await createAccountCategory(
          currentOrg?.id || "",
          formData
        );

        if (!res.success) {
          toast.error(res.error || "Failed to create category");
          return;
        }

        toast.success(res.message || "Category created");

        setOptions(res.select_options);
        setShowCategory(false);
      } catch {
        toast.error("Failed to create category");
      }
    });
  }

  // ================= SUBCATEGORY =================
  async function handleSubCategorySubmit(formData: FormData) {
    if (subCategoryPending) return;

    startSubCategoryTransition(async () => {
      try {
        const res = await createAccountSubCategory(
          currentOrg?.id || "",
          formData
        );

        if (!res.success) {
          toast.error(res.error || "Failed to create subcategory");
          return;
        }

        toast.success(res.message || "Subcategory created");

        setOptions(res.select_options);
        setShowSubCategory(false);
      } catch {
        toast.error("Failed to create subcategory");
      }
    });
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-3xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <ModalHeader
            title="Create Account Setup"
            description="Accounts, Categories & Subcategories"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 py-6 space-y-6">

          {/* ================= TOP ACTION BAR ================= */}
          <div className="flex items-center justify-between gap-3">

           {!showCategory && <button
              type="button"
              onClick={() => {
                setShowCategory((p) => !p);
                setShowSubCategory(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
            >

              <FiFolder />
              Category
            </button>
}
           {!showSubCategory && <button
              type="button"
              onClick={() => {
                setShowSubCategory((p) => !p);
                setShowCategory(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 transition cursor-pointer text-sm font-medium"
            >
              <FiPlus />
              Account Belongs to
            </button>}

          </div>

          {/* ================= CATEGORY ================= */}
          {showCategory && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm relative animate-in fade-in slide-in-from-top-2">

              {/* CLOSE */}
              <button
                onClick={() => setShowCategory(false)}
                className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <FiX />
              </button>

              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FiFolder /> Account Category
              </h3>

              <form action={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                <Input label="Category name" name="name" required />
                 <Select
                  label="Account group"
                  name="group"
                  options={fixed_groups}
                  required
                />
                </div>

                <Button
                  type="submit"
                  disabled={categoryPending}
                  className="w-full"
                >
                  {categoryPending ? "Saving..." : "Create Category"}
                </Button>
              </form>
            </div>
          )}

          {/* ================= SUBCATEGORY ================= */}
          {showSubCategory && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm relative animate-in fade-in slide-in-from-top-2">

              {/* CLOSE */}
              <button
                onClick={() => setShowSubCategory(false)}
                className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <FiX />
              </button>

              <h3 className="font-semibold mb-4">
                Account belongs to
              </h3>

              <form action={handleSubCategorySubmit} className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                 <Input label="Belongs to name" name="name" required />
                 <Select
                  label="Account Category"
                  name="category"
                  options={categories}
                  required
                />
                </div>

                <Button
                  type="submit"
                  disabled={subCategoryPending}
                >
                  {subCategoryPending ? "Saving..." : "Create belongs to"}
                </Button>
              </form>
            </div>
          )}

          {/* ================= ACCOUNT ================= */}
          <div className="bg-gray-50 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FiLayers /> Account
            </h3>

            <form
              key={`account-${resetKey}`}
              action={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Input label="Account name" name="name" required />

                <Select
                  label="Belongs to"
                  name="belongs_to"
                  options={sub_categories}
                  required
                />

                <Input label="Opening balance" name="opening_balance" />

                <Select
                  label="Balance type"
                  name="opening_balance_type"
                  options={[
                    { name: "Debit", id: "debit" },
                    { name: "Credit", id: "credit" },
                  ]}
                />
              </div>

              <Button type="submit" disabled={accountPending} className="w-full">
                {accountPending ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </Modal>
  );
}