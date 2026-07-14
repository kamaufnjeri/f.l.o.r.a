"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  FiMail,
  FiUser,
  FiEdit3,
  FiShield,
  FiCalendar,
  FiPhone,
} from "react-icons/fi";

import { useAuthStore } from "@/stores/authStore";

// import these from your actions
import {
  editProfile,
  archiveProfile,
} from "@/app/actions/user-actions";
import EditableMeta from "../organisations/EditableMeta";
import { User } from "@/types";
import ConfirmModal from "../common/ConfirmationModal";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";

export default function UserProfileClient() {
  const router = useRouter();

  const {
    user,
    setUser,
    logout,
  } = useAuthStore();
  const { clear} = useSelectOptionsStore();

  const [editing, setEditing] = useState(false);
  const [archive, setArchive] = useState(false);
  const [loading, setLoading] = useState(false);
  function hydrateForm(user: User | null) {
      return {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        phone_number: user?.phone_number || "",
      };
    }
  
  const [form, setForm] = useState(() => hydrateForm(user));

  if (!user) return null;

 
  const initials =
    `${form.first_name?.[0] ?? ""}${form.last_name?.[0] ?? ""}`.toUpperCase();

  function cancelEdit() {
    setEditing(false);

    setForm(hydrateForm(user));
  }

  async function saveProfile() {
    if (!user || !user?.id) {
      toast.error('User ID required');
      return;
    }
    try {
      setLoading(true);

      const res = await editProfile(user.id, form);

      if (!res.success) {
        toast.error(res.error || "Failed to update profile");
        return;
      }

      toast.success(res.message || "Profile updated");

      setUser(res.user);

      setEditing(false);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function archiveAccount() {
    if (!user || !user?.id) {
      toast.error('User ID required');
      return;
    }

    try {
      setLoading(true);

      const res = await archiveProfile(user.id);

      if (!res.success) {
        toast.error(res.error || "Unable to archive account.");
        return;
      }

    router.push('/sign-in');
    logout()
    clear();
      toast.success(res.message || "Account archived.");

      
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-10 md:px-10">
  <div className="mx-auto flex max-w-5xl flex-col gap-8">
    {/* ================= HEADER ================= */}
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">
          Profile Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your personal information and account preferences.
        </p>
      </div>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white shadow-md transition hover:bg-indigo-500"
        >
          <FiEdit3 />
          Edit Profile
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={cancelEdit}
            disabled={loading}
            className="rounded-xl cursor-pointer border border-gray-300 px-5 py-2.5 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={saveProfile}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiEdit3 />

            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>

    {/* ================= PROFILE CARD ================= */}
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-semibold text-white shadow-md">
          {initials}
        </div>

        {/* User Details */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            {form.first_name} {form.last_name}
          </h2>

          <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <FiMail />
            {user.email}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            User ID: #{user.id}
          </p>
        </div>

        {/* Account Status */}
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            <FiShield />
            {user.is_active ? "Active Account" : "Archived Account"}
          </span>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            Verified User
          </span>
        </div>
      </div>
    </div>
    {/* INFO GRID */}
    {/* ================= INFO GRID ================= */}
<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  {/* Personal Information */}
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      <FiUser />
      Personal Information
    </h3>

    <div className="mt-6 space-y-5">
      <EditableMeta
          editing={editing}
          icon={<FiUser />}
          label="First Name"
          value={form.first_name}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              first_name: v,
            }))
          }
        /> 
        <EditableMeta
          editing={editing}
          icon={<FiMail />}
          label="Last Name"
          value={form.last_name}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              last_name: v,
            }))
          }
        /> 
        <EditableMeta
          editing={editing}
          icon={<FiPhone />}
          label="Phone Number"
          value={form.phone_number}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              phone_number: v,
            }))
          }
        />
<div className="flex justify-end gap-3">
  {editing ? (
    <>
      <button
        onClick={cancelEdit}
        disabled={loading}
        className="rounded-lg cursor-pointer border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        onClick={saveProfile}
        disabled={loading}
        className="rounded-lg cursor-pointer bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </>
  ) : (
    <button
      onClick={() => setEditing(true)}
      className="rounded-lg cursor-pointer bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
    >
      Edit
    </button>
  )}
</div>
     
    </div>
  </div>

  {/* Account Information */}
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      <FiCalendar />
      Account Information
    </h3>

    <div className="mt-6 space-y-1">
      <InfoRow
        label="Email Address"
        value={user.email}
      />

      <InfoRow
        label="Account Status"
        value={user.is_active ? "Active" : "Archived"}
      />

      <InfoRow
        label="Current Workspace"
        value={user.current_organisation?.org_name ?? "None"}
      />

      <InfoRow
        label="User ID"
        value={user.id}
      />

      <InfoRow
        label="Workspaces"
        value={`${user?.user_organisations?.length}`}
      />
    </div>

    <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <h4 className="font-medium text-indigo-900">
        Account Security
      </h4>

      <p className="mt-2 text-sm text-indigo-700">
        Your email address cannot be changed from this page.
        Contact a system administrator if you need to update
        your login email.
      </p>
    </div>
  </div>
</div>
{/* ================= DANGER ZONE ================= */}
<div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.35em] text-red-500">
        Danger Zone
      </p>

      <h3 className="mt-2 text-xl font-semibold text-gray-900">
        Archive Account
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        Archiving your account will disable your access to all workspaces.
        Your account is <strong>not permanently deleted</strong> and can be
        restored later by a system administrator.
      </p>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-500">
        <li>You will immediately be signed out.</li>
        <li>Your data will be preserved.</li>
        <li>Your workspaces and history remain intact.</li>
        <li>An administrator can reactivate your account later.</li>
      </ul>
    </div>

    <div className="flex flex-col items-stretch gap-3 md:items-end">
      <button
        onClick={() => setArchive(true)}
        disabled={loading}
        className="rounded-xl cursor-pointer bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Archiving..." : "Archive Account"}
      </button>

      <p className="max-w-xs text-center text-xs text-gray-400 md:text-right">
        This action signs you out and disables your account until it is restored.
      </p>
    </div>
  </div>
</div>

{/* ================= FOOTER ================= */}
<div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm">
  <p className="text-sm text-gray-500">
    Your profile settings are automatically synchronized across all of your
    workspaces.
  </p>

  <p className="mt-2 text-xs text-gray-400">
    Last updated changes are reflected the next time your profile is refreshed.
  </p>
</div>

</div>
 {(archive) &&  <ConfirmModal
                open={archive}
                onClose={() => setArchive(false)}
                title="Archive Account?"
                description="Your account will be disabled and you will be signed out.
               An administrator can restore your account later."
                confirmText="Archive"
                tone="danger"
                onConfirm={archiveAccount}
              />
             }
</div>
);
}

/* ---------------- FIELD ---------------- */

// function Field({

//   label,

//   value,

//   editable,

// }: {

//   label: string;

//   value: string;

//   editable: boolean;

// }) {

//   return (

//     <div>

//       <p className="text-xs text-gray-500">{label}</p>



//       {editable ? (

//         <input

//           defaultValue={value}

//           className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"

//         />

//       ) : (

//         <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>

//       )}

//     </div>

//   );

// }


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