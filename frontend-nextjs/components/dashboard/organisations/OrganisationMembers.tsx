"use client";

import { Organisation, OrgUser, User } from "@/types";
import { FiUsers } from "react-icons/fi";
import MemberCard from "./MemberCard";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { changeMemberRoleOrganisation, removeMemberOrganisation } from "@/app/actions/org-actions";
import ConfirmModal from "../common/ConfirmationModal";

interface Props {
  organisation: Organisation;
  organisationUsers: OrgUser[];
  setUser: (user: User | null) => void;
  isSuperAdmin: boolean;
}

export default function OrganisationMembers({
  organisation,
  organisationUsers,
  setUser,
  isSuperAdmin
}: Props) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleRemoveMember = async () => {
    if (!isSuperAdmin) {
        toast.error('Only super admin can remove member');
        return;
    }
    if (!selectedMemberId) {
      toast.error("No member selected");
      return;
    }
    try {
       const res = await removeMemberOrganisation(organisation.id, selectedMemberId);

      if (res?.success) {
        toast.success(res.message || "Member removed");
        
        // redirect or remove from list here
        setUser(res.user)

      } else {
        toast.error(res?.error || "Delete failed");
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed");
    } finally {
      setShowRemoveModal(false);
      setSelectedMemberId(null);
    }
   
  };

   const handleMemberRoleChange = async (userId: string, userRole: "admin" |"editor" | "viewer") => {
    if (!isSuperAdmin) {
        toast.error('Only super admin can change member role');
        return;
    }

  
    try {
       const res = await changeMemberRoleOrganisation(organisation.id, userId, userRole);

      if (res?.success) {
        toast.success(res.message || "Member removed");
        
        // redirect or remove from list here
        setUser(res.user)

      } else {
        toast.error(res?.error || "Delete failed");
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed");
    } finally {
      setShowRemoveModal(false);
      setSelectedMemberId(null);
    }
   
  };


  return (
    <>
    <div className="mt-8">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <FiUsers className="text-indigo-600" />

          <h3 className="font-semibold text-gray-900">
            Members
          </h3>

        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
          {organisationUsers?.length || 0}
        </span>

      </div>

      {organisationUsers?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No members found.
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

          {organisationUsers?.map((member) => (
            
            <MemberCard
              key={member.user_id}
              member={member}
              isSuperAdmin={isSuperAdmin}
              enableRemove={() => {
                setSelectedMemberId(member.user_id);
                setShowRemoveModal(true);
              }}
              handleRoleChange={handleMemberRoleChange}
            />
          ))}

        </div>
      )}

    </div>
     {(showRemoveModal && isSuperAdmin) &&  <ConfirmModal
                open={showRemoveModal}
                onClose={() => setShowRemoveModal(false)}
                title="Remove Member"
                description="This will remove the member from the organisation."
                confirmText="Remove"
                tone="danger"
                onConfirm={handleRemoveMember}
              />
             }
    </>
  );

}