"use client";

import {
  FiDollarSign,
  FiEdit3,
  FiGlobe,
  FiHash,
  FiLayers,
  FiMail,
  FiPhone,
  FiSave,
  FiUsers,
} from "react-icons/fi";

import EditableMeta from "./EditableMeta";
import MetaCard from "./MetaCard";
import { Organisation, OrgUser, User } from "@/types";
import OrganisationMembers from "./OrganisationMembers";
import { useState } from "react";
import InviteModal from "./InviteModal";
import { toast } from "react-hot-toast";
import { editOrganisation } from "@/app/actions/org-actions";

interface Props {
  organisation: Organisation;
  organisationUsers: OrgUser[];
  setUser: (user: User | null) => void;
  isSuperAdmin: boolean;
}

export default function CurrentOrganisationCard({
  organisation,
  organisationUsers,
  setUser,
  isSuperAdmin,
}: Props) {
  const [openInvite, setOpenInvite] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  function hydrateForm(org: Organisation | null) {
      return {
        org_name: org?.org_name || "",
        org_email: org?.org_email || "",
        org_phone_number: org?.org_phone_number || "",
        country: org?.country || "",
        currency: org?.currency || "",
      };
    }
  
  const [form, setForm] = useState(() => hydrateForm(organisation));

    async function onSave() {
      if (!isSuperAdmin) {
        toast.error('Only super admin can edit');
        return;
      }
      setLoading(true);
      try {
        const res = await editOrganisation(organisation.id, form);

        if (!res.success) {
          toast.error(res.error || "Something went wrong");
          return;
        } else {
          setUser(res.user);
          setForm(hydrateForm(res.user.current_organisation));

          toast.success(res.message || "Organisation updated");

          setEditing(false);
        }
        
      } catch {
        toast.error("Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    }
    

  return (
    <>
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <FiLayers className="text-indigo-600" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              Active Workspace
            </p>

            {(editing && isSuperAdmin) ? (
              <input
                value={form.org_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    org_name: e.target.value,
                  }))
                }
                className="mt-1 border-b bg-transparent text-2xl font-semibold outline-none focus:border-indigo-500"
              />
            ) : (
              <h2 className="mt-1 text-2xl font-semibold">
                {organisation.org_name}
              </h2>
            )}
          </div>
        </div>
{isSuperAdmin && (
<div className="flex gap-2">
    <button
      onClick={() => {
        setEditing((prev) => !prev);
        setForm(hydrateForm(organisation));
      }}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
    >
      <FiEdit3 />
      {editing ? "Cancel" : "Edit"}
    </button>


  <button
    onClick={() => setOpenInvite(true)}
    className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
  >
    <FiUsers />
    Invite
  </button>
</div>)}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetaCard
          icon={<FiHash />}
          label="ID"
          value={organisation.id}
        />

        <EditableMeta
           editing={editing && isSuperAdmin}
          icon={<FiMail />}
          label="Email"
          value={form.org_email}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              org_email: v,
            }))
          }
        />

        <EditableMeta
           editing={editing && isSuperAdmin}
          icon={<FiPhone />}
          label="Phone"
          value={form.org_phone_number}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              org_phone_number: v,
            }))
          }
        />

        <EditableMeta
           editing={editing && isSuperAdmin}
          icon={<FiGlobe />}
          label="Country"
          value={form.country}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              country: v,
            }))
          }
        />

        <EditableMeta
           editing={editing && isSuperAdmin}
          icon={<FiDollarSign />}
          label="Currency"
          value={form.currency}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              currency: v,
            }))
          }
        />
      </div>

      {(editing && isSuperAdmin) && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onSave}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm text-white hover:bg-indigo-500"
          >
            <FiSave />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
      <OrganisationMembers
        organisation={organisation}
        setUser={setUser}
        organisationUsers={organisationUsers}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
    {(openInvite && isSuperAdmin) && <InviteModal onClose={() => setOpenInvite(false)} setUser={setUser} organisationId={organisation.id} />}

    </>
  );
}