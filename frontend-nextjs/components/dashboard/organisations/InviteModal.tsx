"use client";

import { useState, useTransition } from "react";
import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import FormWrapper from "@/components/forms/FormWrapper";
import { sendInvites } from "@/app/actions/org-actions";
import InviteInput from "./InviteInput";
import { toast } from "react-hot-toast";
import { User } from "@/types";
import Button from "@/components/forms/Button";

export type Invite = {
  email: string;
  role: "viewer" | "editor" | "admin";
};

export default function InviteModal({
  onClose,
  setUser,
  organisationId
}: {
  onClose: () => void;
  setUser: (user: User) => void;
  organisationId: string;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
const [pending, startTransition] = useTransition();
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(formData: FormData) {
    if (pending) return;

    startTransition(async () => {
      try {
        const res = await sendInvites(formData, organisationId);

        if (!res.success) {
          toast.error(res.error || "Something went wrong.");
          return;
        }

        toast.success(res.message || "Success");
        setUser(res.user);

        onClose();
        // Reliable form reset for Server Actions
        setResetKey((prev) => prev + 1);

      } catch (error) {
        console.error(error);

        toast.error(
          "Something went wrong. Please try again."
        );
      }
    });
  }

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader
          title="Invite Team Members"
          description="Send invitations to join your organization"
          onClose={onClose}
        />

        <div className="overflow-y-auto px-6 py-6">
          <div className="rounded-xl bg-gray-50 p-5 sm:p-6">
            <form
              key={resetKey}
              action={handleSubmit}
              className={[
                "w-full space-y-6",
                "rounded-3xl",
                "border border-zinc-200/60",
                "bg-white/90 backdrop-blur-sm",
                "p-6 sm:p-8",
                "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
              ].join(" ")}
            >
              <InviteInput
                name="invites"
                value={invites}
                onChange={setInvites}
                max={5}
              />
                <Button
                      type="submit"
                      disabled={pending}
                      aria-disabled={pending}
                      aria-busy={pending}
                      className={[
                        "relative w-full overflow-hidden",
                        "rounded-xl py-3 font-semibold",
                        "transition-all duration-300",
                        pending
                          ? "cursor-not-allowed opacity-80"
                          : "hover:-translate-y-0.5",
                      ].join(" ")}
                    >
                      <span className="flex items-center justify-center gap-2">
                        
                        {pending && (
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-20"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
              
                            <path
                              className="opacity-90"
                              fill="currentColor"
                              d="M22 12a10 10 0 00-10-10v4a6 6 0 016 6h4z"
                            />
                          </svg>
                        )}
              
                        <span>
                          {pending
                            ? "Sending invite..."
                            : "Send Invite"}
                        </span>
                      </span>
                    </Button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}