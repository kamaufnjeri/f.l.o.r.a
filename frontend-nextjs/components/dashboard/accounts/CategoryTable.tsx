"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Category, FixedGroup } from "@/types";

type CategoryTableProps = {
  categories: Category[];
  fixedGroups: FixedGroup[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export default function CategoryTable({
  categories,
  fixedGroups,
  loading,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  function getGroupName(groupId: string) {
    return fixedGroups.find((g) => g.id === groupId)?.name || "-";
  }

  return (
    <div className="w-full border rounded-xl bg-white overflow-hidden">
      {/* HEADER */}
      <div className="grid grid-cols-3 bg-gray-50 text-xs sm:text-sm font-medium text-gray-500 px-4 py-3 border-b">
        <div>Name</div>
        <div>Group</div>
        <div className="text-right">Actions</div>
      </div>

      {/* BODY */}
      {categories.length === 0 ? (
        <div className="p-8 text-sm text-gray-500 text-center">
          No categories found
        </div>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            className="grid grid-cols-3 px-4 py-3 items-center border-b hover:bg-gray-50 transition"
          >
            {/* NAME */}
            <div className="text-sm font-medium text-gray-800">
              {category.name}
            </div>

            {/* GROUP */}
            <div className="text-sm text-gray-600">
              {getGroupName(category.group ?? "")}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onEdit(category)}
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition"
              >
                <FiEdit2 size={16} className="text-gray-600" />
              </button>

              <button
  disabled={loading}
  onClick={() => onDelete(category)}
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