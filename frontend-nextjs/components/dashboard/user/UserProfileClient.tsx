"use client";

import { useState } from "react";
import { User } from "@/types";
import {
  FiMail,
  FiPhone,
  FiUser,
  FiEdit3,
  FiShield,
  FiCalendar,
} from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";


export default function UserProfileClient() {
  const [editing, setEditing] = useState(false);
  const { user } = useAuthStore();

  if (!user) return null;

  const initials =
    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 md:px-10 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

          <div>
            <p className="text-xs tracking-[0.35em] text-gray-400 uppercase">
              Account
            </p>

            <h1 className="text-3xl md:text-4xl font-semibold mt-2 text-gray-900">
              Profile Settings
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Manage your personal information and account preferences
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex cursor-pointer items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <FiEdit3 />
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            {/* AVATAR */}
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold shadow-md">
              {initials}
            </div>

            {/* USER INFO */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>

              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <FiMail />
                {user.email}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                User ID: #{user.id}
              </p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200">
              <FiShield />
              Verified Account
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PERSONAL INFO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FiUser />
              Personal Information
            </h3>

            <div className="mt-6 space-y-4">

              <Field label="First Name" value={user.first_name} editable={editing} />
              <Field label="Last Name" value={user.last_name} editable={editing} />
              <Field label="Phone Number" value={user.phone_number || "Not set"} editable={editing} />

            </div>
          </div>

          {/* ACCOUNT INFO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FiCalendar />
              Account Information
            </h3>

            <div className="mt-6 space-y-4">

              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="Account Type" value="Standard User" />
              <InfoRow label="Status" value="Active" />
              <InfoRow label="User ID" value={`#${user.id}`} />

            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h3 className="text-sm font-semibold text-red-600">
                Danger Zone
              </h3>

              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Once you delete your account, this action cannot be undone.
                All your data will be permanently removed.
              </p>
            </div>

            <button
              onClick={() => console.log("Delete account clicked")}
              className="cursor-pointer bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition"
            >
              Delete Account
            </button>

          </div>
        </div>

        {/* FOOTER */}
        <div className="text-xs text-gray-400 text-center">
          Profile settings are synced across all your workspaces
        </div>

      </div>
    </div>
  );
}

/* ---------------- FIELD ---------------- */
function Field({
  label,
  value,
  editable,
}: {
  label: string;
  value: string;
  editable: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>

      {editable ? (
        <input
          defaultValue={value}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
      )}
    </div>
  );
}

/* ---------------- INFO ROW ---------------- */
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-none">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}