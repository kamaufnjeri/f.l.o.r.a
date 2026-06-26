"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";

import CategoryTable from "./CategoryTable";
import SubCategoryTable from "./SubCategoryTable";
import CategoryFormModal from "./CategoryFormModal";
import SubCategoryFormModal from "./SubCategoryFormModal";

import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { useAuthStore } from "@/stores/authStore";

import { deleteCategory } from "@/app/actions/account-actions";
import { Category, SubCategory } from "@/types";

type ViewMode = "categories" | "subcategories";

export default function ManageCategoriesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { currentOrg } = useAuthStore();

  const { categories, sub_categories, fixed_groups, setOptions } =
    useSelectOptionsStore();

  const [view, setView] = useState<ViewMode>("categories");
  const [loading, setLoading] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(
    null
  );

  // ================= DELETE CATEGORY =================
  async function handleDeleteCategory(id: string) {
    setLoading(true);
    try {
      const res = await deleteCategory(
        currentOrg?.id || "",
        id,
        "categories"
      );

      if (!res.success) {
        toast.error(res.error || "Failed to delete category");
        return;
      }

      toast.success(res.message || "Category deleted");
      setOptions(res.select_options);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE SUB CATEGORY =================
  async function handleDeleteSubCategory(id: string) {
    setLoading(true);
    try {
      const res = await deleteCategory(
        currentOrg?.id || "",
        id,
        "sub-categories"
      );

      if (!res.success) {
        toast.error(res.error || "Failed to delete sub category");
        return;
      }

      toast.success(res.message || "Sub category deleted");
      setOptions(res.select_options);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="w-full max-w-6xl flex flex-col max-h-[90vh] bg-white rounded-xl">

          {/* HEADER */}
          <div className="sticky top-0 z-10 bg-white border-b">
            <ModalHeader
              title="Manage Categories"
              description="Organize your accounting structure with categories & sub categories"
              onClose={onClose}
            />
          </div>

          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b bg-gray-50">

            {/* TABS */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("categories")}
                className={`
                  px-4 py-2 text-sm cursor-pointer font-medium rounded-lg transition
                  ${
                    view === "categories"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-primary hover:bg-white border border-gray-200"
                  }
                `}
              >
                Categories
              </button>

              <button
                type="button"
                onClick={() => setView("subcategories")}
                className={`
                  px-4 py-2 cursor-pointer text-sm font-medium rounded-lg transition
                  ${
                    view === "subcategories"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-primary hover:bg-white border border-gray-200"
                  }
                `}
              >
                Sub Categories
              </button>
            </div>

            {/* ACTION BUTTON */}
            <div className="flex justify-end">
              {view === "categories" ? (
                <button
                  onClick={() => {
                    setEditCategory(null);
                    setShowCategoryForm(true);
                  }}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
                >
                  + Add Category
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditSubCategory(null);
                    setShowSubCategoryForm(true);
                  }}
                  className="px-4 cursor-pointer py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
                >
                  + Add Sub Category
                </button>
              )}
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {view === "categories" ? (
              <CategoryTable
                categories={categories}
                fixedGroups={fixed_groups}
                loading={loading}
                onEdit={(cat) => {
                  setEditCategory(cat);
                  setShowCategoryForm(true);
                }}
                onDelete={(cat) => handleDeleteCategory(cat.id)}
              />
            ) : (
              <SubCategoryTable
                subCategories={sub_categories}
                categories={categories}
                loading={loading}
                onEdit={(sub) => {
                  setEditSubCategory(sub);
                  setShowSubCategoryForm(true);
                }}
                onDelete={(sub) => handleDeleteSubCategory(sub.id)}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* CATEGORY FORM */}
      {showCategoryForm && (
        <CategoryFormModal
          open={showCategoryForm}
          onClose={() => {
            setShowCategoryForm(false);
            setEditCategory(null);
          }}
          mode={editCategory ? "edit" : "create"}
          initialData={editCategory}
        />
      )}

      {/* SUB CATEGORY FORM */}
      {showSubCategoryForm && (
        <SubCategoryFormModal
          open={showSubCategoryForm}
          onClose={() => {
            setShowSubCategoryForm(false);
            setEditSubCategory(null);
          }}
          mode={editSubCategory ? "edit" : "create"}
          initialData={editSubCategory}
        />
      )}
    </>
  );
}