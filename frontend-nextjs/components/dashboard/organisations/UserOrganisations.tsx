"use client";

import { FiArrowRight, FiArchive, FiRefreshCw } from "react-icons/fi";
import { Organisation, UserOrganisation } from "@/types";
import { useState } from "react";
import ConfirmModal from "../common/ConfirmationModal";

interface Props {
  organisations: UserOrganisation[];
  currentOrg: Organisation;
  loading?: boolean;

  switchOrg: (orgId: string) => void;
  updateArchiveOrganisation: (orgId: string, isArchived: boolean) => void;
}

export default function UserOrganisations({
  organisations,
  currentOrg,
  loading = false,
  switchOrg,
  updateArchiveOrganisation,
}: Props) {
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archive, setArchive] = useState(false);
    const [archiveOrg, setArchiveOrg] = useState<UserOrganisation | null>(null);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
            Your Workspaces
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            Organisations
          </h2>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {organisations.length} total
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {organisations.map((org) => {
          const isCurrent = currentOrg.id === org.org_id;

          return (
            <div
              key={org.org_id}
              className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                isCurrent
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Name */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.org_name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {org.org_id.slice(0, 8)}...
                  </p>
                </div>

                {isCurrent && (
                  <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                    CURRENT
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="mt-6 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    org.is_archived
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {org.is_archived ? "Archived" : "Active"}
                </span>

                {org.is_super_admin && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    Super Admin
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                {/* Current workspace */}
                {isCurrent ? (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-xl bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700"
                  >
                    Current Workspace
                  </button>
                ) : org.is_archived ? (
                  <>
                    {org.is_super_admin && (
                      <button
                        onClick={() => {
                            setShowArchiveModal(true);
                            setArchive(false);
                            setArchiveOrg(org);
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                      >
                        <FiRefreshCw />
                        Unarchive
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      disabled={loading}
                      onClick={() => switchOrg(org.org_id)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                    >
                      <FiArrowRight />
                      {loading ? 'Switching...' : 'Switch'}
                    </button>

                    {org.is_super_admin && (
                      <button
                          onClick={() => {
                            setShowArchiveModal(true);
                            setArchive(true);
                            setArchiveOrg(org)
                        }}                        
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                      >
                        <FiArchive />
                        Archive
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="fixed bottom-6 right-6 rounded-full bg-gray-900 px-5 py-3 text-sm text-white shadow-xl">
          Processing...
        </div>
      )}
      {(showArchiveModal && archiveOrg) &&  <ConfirmModal
                      open={showArchiveModal}
                      onClose={() => setShowArchiveModal(false)}
                      title="Archive Account?"
                      description="Your account will be disabled and you will be signed out.
                     An administrator can restore your account later."
                      confirmText={archiveOrg.is_archived ? 'Unarchive' : 'Archive'}
                      tone="danger"
                      onConfirm={() => updateArchiveOrganisation(archiveOrg.org_id, archive)}
                    />
                   }
    </div>
  );
}