"use client";

import { useState } from "react";
import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import FormWrapper from "@/components/forms/FormWrapper";
import { sendInvites } from "@/app/actions/org-actions";
import TagInput from "@/components/forms/TagsInput";

export default function InviteModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [emails, setEmails] = useState<string[]>([]);


  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <ModalHeader
          title="Invite Team Members"
          description="Send invitations to join your organization"
          onClose={onClose}
        />

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-6">

          <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
            <FormWrapper
              action={sendInvites}
              onSuccess={onClose}
              buttonLabel="Send Invites"
              buttonLoadingLabel="Sending..."
            >
              <div className="space-y-4">

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email addresses
                  </label>

                  <div className="mt-2">
                    <TagInput
                      name='emails'
                      value={emails}
                      onChange={setEmails}
                      max={5}
                      placeholder="Type email and press enter"
                    />
                  </div>
                </div>

              </div>
            </FormWrapper>
          </div>

        </div>

      </div>
    </Modal>
  );
}