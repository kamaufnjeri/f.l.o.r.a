"use client";

import { useState } from "react";
import CreateOrgModal from "./CreateOrgModal";
import InviteModal from "./InviteModal";
import { useAuthStore } from "@/stores/authStore";
import { changeOrganisation } from "@/app/actions/org-actions";
import toast from "react-hot-toast";

import {
  FiPlus,
  FiUsers,
  FiPhone,
  FiGlobe,
  FiDollarSign,
  FiHash,
  FiArrowRight,
  FiLayers,
  FiMail,
  FiEdit3,
  FiSave,
} from "react-icons/fi";
import { Organisation } from "@/types";

export default function OrganisationClient() {
  const [openInvite, setOpenInvite] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(false);

  const { currentOrg, userOrgs, setCurrentOrg } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /* ---------------- SAFE FORM HYDRATION ---------------- */
  function hydrateForm(org: Organisation | null) {
    return {
      org_name: org?.org_name || "",
      org_email: org?.org_email || "",
      org_phone_number: org?.org_phone_number || "",
      country: org?.country || "",
      currency: org?.currency || "",
    };
  }

  const [form, setForm] = useState(() => hydrateForm(currentOrg));

  /* ---------------- SWITCH ORG ---------------- */
  async function switchOrg(orgId: string) {
    if (!orgId || orgId === currentOrg?.id) return;

    try {
      setLoading(true);

      const res = await changeOrganisation(orgId);

      if (res.success) {
        toast.success("Workspace switched");

        setCurrentOrg(res.data || null);

        // 🔥 IMPORTANT: manual hydration instead of useEffect
        setForm(hydrateForm(res.data));

        setEditing(false);
      } else {
        toast.error(res.error || "Failed to switch");
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 md:px-10 py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

          <div>
            <p className="text-xs tracking-[0.35em] text-gray-400 uppercase">
              Workspace Control
            </p>

            <h1 className="text-4xl font-semibold mt-2 text-gray-900">
              Organisations
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-md">
              Manage, switch and collaborate across your organisation workspaces.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <FiPlus />
            Create Organisation
          </button>

        </div>

        {/* CURRENT ORG */}
        {currentOrg && (
          <div className="border border-gray-200 rounded-2xl shadow-sm p-6 bg-white">

            {/* TOP */}
            <div className="flex items-start justify-between">

              <div className="flex items-start gap-3">

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <FiLayers className="text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">
                    Active Workspace
                  </p>

                  {editing ? (
                    <input
                      value={form.org_name}
                      onChange={(e) =>
                        setForm({ ...form, org_name: e.target.value })
                      }
                      className="text-2xl font-semibold mt-1 border-b outline-none focus:border-indigo-500 bg-transparent"
                    />
                  ) : (
                    <h2 className="text-2xl font-semibold mt-1">
                      {currentOrg.org_name}
                    </h2>
                  )}
                </div>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  <FiEdit3 />
                  {editing ? "Cancel" : "Edit"}
                </button>

                <button
                  onClick={() => setOpenInvite(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  <FiUsers />
                  Invite
                </button>

              </div>

            </div>

            {/* META GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">

              <Meta icon={<FiHash />} label="ID" value={currentOrg.id} />

              <EditableMeta
                editing={editing}
                icon={<FiMail />}
                label="Email"
                value={form.org_email}
                onChange={(v) => setForm({ ...form, org_email: v })}
              />

              <EditableMeta
                editing={editing}
                icon={<FiPhone />}
                label="Phone"
                value={form.org_phone_number}
                onChange={(v) => setForm({ ...form, org_phone_number: v })}
              />

              <EditableMeta
                editing={editing}
                icon={<FiGlobe />}
                label="Country"
                value={form.country}
                onChange={(v) => setForm({ ...form, country: v })}
              />

              <EditableMeta
                editing={editing}
                icon={<FiDollarSign />}
                label="Currency"
                value={form.currency}
                onChange={(v) => setForm({ ...form, currency: v })}
              />

            </div>

            {/* SAVE BAR */}
            {editing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    console.log("SAVE PAYLOAD:", form);
                    setEditing(false);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm"
                >
                  <FiSave />
                  Save Changes
                </button>
              </div>
            )}

          </div>
        )}

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between">
          <p className="text-xs tracking-[0.35em] text-gray-400 uppercase">
            Your Workspaces
          </p>

          <span className="text-xs text-gray-400">
            {userOrgs.length} total
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {userOrgs.map((org) => {
            const isActive = org.org_id === currentOrg?.id;

            return (
              <button
                key={org.org_id}
                onClick={() => switchOrg(org.org_id)}
                className={`
                  group text-left rounded-2xl p-6 border transition-all duration-300
                  hover:-translate-y-1 hover:shadow-lg
                  ${
                    isActive
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {org.org_name}
                  </h3>

                  {isActive && (
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
                  <span>ID: {org.org_id.slice(0, 8)}...</span>
                  <FiArrowRight className="opacity-60 group-hover:translate-x-1 transition" />
                </div>

              </button>
            );
          })}

        </div>

        {/* LOADING */}
        {loading && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-xl">
            Switching workspace...
          </div>
        )}

        {/* MODALS */}
        {openCreate && <CreateOrgModal onClose={() => setOpenCreate(false)} />}
        {openInvite && <InviteModal onClose={() => setOpenInvite(false)} />}
      </div>
    </div>
  );
}

/* ---------------- META ---------------- */
function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-900 truncate">
        {value}
      </p>
    </div>
  );
}

/* ---------------- EDITABLE META ---------------- */
function EditableMeta({
  icon,
  label,
  value,
  editing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        {icon}
        {label}
      </div>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full text-sm font-medium text-gray-900 bg-transparent border-b outline-none focus:border-indigo-500"
        />
      ) : (
        <p className="mt-2 text-sm font-medium text-gray-900 truncate">
          {value || "—"}
        </p>
      )}
    </div>
  );
}