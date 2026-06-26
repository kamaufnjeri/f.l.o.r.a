"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SubCategory, Category } from "@/types";

type SubCategoryTableProps = {
  subCategories: SubCategory[];
  categories: Category[];
  loading: boolean;
  onEdit: (subCategory: SubCategory) => void;
  onDelete: (subCategory: SubCategory) => void;
};

export default function SubCategoryTable({
  subCategories,
  categories,
  loading,
  onEdit,
  onDelete,
}: SubCategoryTableProps) {
  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  }

  return (
    <div className="w-full border rounded-xl bg-white overflow-hidden">
      {/* HEADER */}
      <div className="grid grid-cols-3 bg-gray-50 text-xs sm:text-sm font-medium text-gray-500 px-4 py-3 border-b">
        <div>Name</div>
        <div>Category</div>
        <div className="text-right">Actions</div>
      </div>

      {/* BODY */}
      {subCategories.length === 0 ? (
        <div className="p-8 text-sm text-gray-500 text-center">
          No sub categories found
        </div>
      ) : (
        subCategories.map((sub) => (
          <div
            key={sub.id}
            className="grid grid-cols-3 px-4 py-3 items-center border-b hover:bg-gray-50 transition"
          >
            {/* NAME */}
            <div className="text-sm font-medium text-gray-800">
              {sub.name}
            </div>

            {/* CATEGORY */}
            <div className="text-sm text-gray-600">
              {getCategoryName(sub.category ?? "")}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onEdit(sub)}
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition"
              >
                <FiEdit2 size={16} className="text-gray-600" />
              </button>

             <button
  disabled={loading}
  onClick={() => onDelete(sub)}
  className="p-2 rounded-md hover:bg-red-50 cursor-pointer text-red-600 transition disabled:opacity-50 flex items-center justify-center"
>
  {loading ? (
    <span className="relative w-4 h-4">
      {/* soft background ring */}
      <span className="absolute inset-0 rounded-full border-2 border-red-200 opacity-60"></span>

      {/* animated spinner */}
      <span className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
    </span>
  ) : (
    <FiTrash2 size={16} />
  )}
</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}