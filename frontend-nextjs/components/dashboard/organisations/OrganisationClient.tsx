"use client";

import { useState } from "react";
import CreateOrgModal from "./CreateOrgModal";
import { useAuthStore } from "@/stores/authStore";
import { archiveOrganisation, changeOrganisation } from "@/app/actions/org-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  FiPlus,
} from "react-icons/fi";
import CurrentOrganisationCard from "./CurrentOrganisationCard";
import UserOrganisations from "./UserOrganisations";

export default function OrganisationClient() {
  const [openCreate, setOpenCreate] = useState(false);
  const router = useRouter();
  const { currentOrg, currentOrgUsers, userOrgs, setUser, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const isSuperAdmin = user?.id === currentOrg?.super_admin;

  async function switchOrg(orgId: string) {
  if (!orgId || orgId === currentOrg?.id) return;

  try {
    setLoading(true);

    const res = await changeOrganisation(orgId);

    if (!res.success) {
      toast.error(res.error || "Failed to switch workspace");
      return;
    }

    toast.success(res.message || "Workspace switched");

    setUser(res.user);

    router.push(`/dashboard/${orgId}/organisations`);
  } catch {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
}

async function updateArchiveOrganisation(orgId: string, isArchived: boolean) {

  try {
    setLoading(true);

    const res = await archiveOrganisation(orgId, { is_archived: isArchived });

    if (!res.success) {
      toast.error(res.error || "Failed to archive workspace");
      return;
    }

    toast.success(res.message);

    setUser(res.user);

  } catch {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
}

console.log('user id', currentOrg?.super_admin, user?.id);


 
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
            organisationUsers={currentOrgUsers}
            setUser={setUser}
            isSuperAdmin={isSuperAdmin}
          />
        )}
        {(userOrgs && currentOrg) && <UserOrganisations organisations={userOrgs} currentOrg={currentOrg} switchOrg={switchOrg} updateArchiveOrganisation={updateArchiveOrganisation} loading={loading}/>}


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