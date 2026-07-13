"use client";

import { useState } from "react";
import CreateOrgModal from "./CreateOrgModal";
import { useAuthStore } from "@/stores/authStore";
import { changeOrganisation } from "@/app/actions/org-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
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
import CurrentOrganisationCard from "./CurrentOrganisationCard";

export default function OrganisationClient() {
  const [openCreate, setOpenCreate] = useState(false);
  const router = useRouter();
  const { currentOrg, userOrgs, currentOrgUsers, setCurrentOrg, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /* ---------------- SWITCH ORG ---------------- */
  async function switchOrg(orgId: string) {
    if (!orgId || orgId === currentOrg?.id) return;

    try {
      setLoading(true);

      const res = await changeOrganisation(orgId);

      if (res.success) {
        toast.success("Workspace switched");
        router.push(`/dashboard/${orgId}/organisations`);

        setCurrentOrg(res.data || null);

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
            className="flex cursor-pointer items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md transition"
          >
            <FiPlus />
            Create Organisation
          </button>

        </div>

        {currentOrg && (
          <CurrentOrganisationCard
            organisation={currentOrg}
            setOrganisation={setCurrentOrg}
            organisationUsers={currentOrgUsers}
            setUser={setUser}
          />
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
                  group cursor-pointer text-left rounded-2xl p-6 border transition-all duration-300
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