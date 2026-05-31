"use client";

import { useState } from "react";
import CreateOrgModal from "./CreateOrgModal";
import InviteModal from "./InviteModal";

export default function OrganisationClient() {
  const [openInvite, setOpenInvite] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="h-full w-full flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organisations</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-xl bg-gray-900 px-4 py-2 text-white"
          >
            + Create
          </button>

          <button
            onClick={() => setOpenInvite(true)}
            className="rounded-xl bg-primary px-4 py-2 text-white"
          >
            Invite Users
          </button>
        </div>
      </div>

      {/* CONTENT AREA (you can later add org list here) */}
      <div className="text-gray-500">
        Select an organisation or create one.
      </div>

      {/* MODALS */}
      {openCreate && (
        <CreateOrgModal onClose={() => setOpenCreate(false)} />
      )}

      {openInvite && (
        <InviteModal onClose={() => setOpenInvite(false)} />
      )}
    </div>
  );
}