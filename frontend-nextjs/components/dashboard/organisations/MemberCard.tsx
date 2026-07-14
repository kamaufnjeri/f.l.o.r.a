"use client";

import { normalizeWord } from "@/lib/utils";
import { OrgUser } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { FiCheck, FiLoader, FiTrash2, FiUser } from "react-icons/fi";

interface Props {
  member: OrgUser;
  enableRemove?: () => void;
  isSuperAdmin: boolean;
  handleRoleChange: (
    userId: string,
    userRole: "admin" | "editor" | "viewer"
  ) => void;
}

function roleColor(role: string) {
  if (!role) return "bg-gray-100 text-gray-700";

  switch (role.toLowerCase()) {
    case "admin":
      return "bg-green-100 text-green-700";

    case "editor":
      return "bg-blue-100 text-blue-700";

    case "viewer":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function MemberCard({
  member,
  enableRemove,
  isSuperAdmin,
  handleRoleChange,
}: Props) {
  const [editingRole, setEditingRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<
    "admin" | "editor" | "viewer" | 'super_admin'
  >(member.user_role);

  const saveRole = () => {
    setLoading(true);
    try {
      if (role !== member.user_role) {
        handleRoleChange(member.user_id, role as "admin" | "editor" | "viewer");

      } else {
        toast.error('Same role selected')
      }
    } finally {
      setEditingRole(false);

      setLoading(false);
    }
  };

  return (
    <div className="flex items-start flex-col gap-4 justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50">
      <div className="flex items-start flex-wrap gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
          <FiUser className="text-indigo-600" />
        </div>

        <div>
          <h4 className="font-medium text-gray-900">
            {member.user_name}
          </h4>

          <p className="text-sm text-gray-500">
            {member.user_email}
          </p>

          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              member.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {member.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(isSuperAdmin && role !== 'super_admin') ? (
          editingRole ? (
            <>
              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as
                      | "admin"
                      | "editor"
                      | "viewer"
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm outline-none focus:border-indigo-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>

            <button
  disabled={loading}
  onClick={saveRole}
  className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? (
    <FiLoader className="h-4 w-4 animate-spin" />
  ) : (
    <FiCheck />
  )}
</button>
 <button
  disabled={loading}
  onClick={() => setEditingRole(false)}
  className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  <FaTimes/>
</button>
            </>
          ) : (
            <button
              onClick={() => setEditingRole(true)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80 ${roleColor(
                member.user_role
              )}`}
            >
              {normalizeWord(member.user_role)}
            </button>
          )
        ) : (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${roleColor(
              member.user_role
            )}`}
          >
            {normalizeWord(member.user_role)}
          </span>
        )}

        {(isSuperAdmin && member.user_role !== 'super_admin') && (
          <button
            disabled={!isSuperAdmin}
            onClick={enableRemove}
            className="cursor-pointer rounded-lg p-2 text-red-600 hover:bg-red-50"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
    </div>
  );
}