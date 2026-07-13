"use client";

import { OrgUser } from "@/types";
import { FiTrash2, FiUser } from "react-icons/fi";

interface Props {
  member: OrgUser;
  enableRemove?: () => void;
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
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition">

      <div className="flex items-center gap-4">

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

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${roleColor(
            member.user_role
          )}`}
        >
          {member.user_role}
        </span>

        <button
          onClick={enableRemove}
          className="rounded-lg cursor-pointer p-2 text-red-600 hover:bg-red-50"
        >
          <FiTrash2 />
        </button>
      

      </div>

    </div>
  );
}