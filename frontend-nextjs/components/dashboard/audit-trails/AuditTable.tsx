'use client'

import { useState } from "react";
import { FiEye } from "react-icons/fi";
import AuditViewerModal from "./AuditViewModal";
import { AuditTrail } from "./types";


export default function AuditTable({ audits, organisationId }: { audits: AuditTrail[], organisationId: string }) {

  const [selectedAudit, setSelectedAudit] = useState<AuditTrail | null>(null);


  return (
    <>
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Model</th>
              <th className="p-3 text-left">Changed By</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>


          <tbody className="divide-y">

            {audits.map((audit) => (

              <tr
                key={audit.id}
                className="hover:bg-gray-50"
              >

                <td className="p-3">
                  {audit.action}
                </td>

                <td className="p-3 font-medium">
                  {audit.model_name}
                </td>


                <td className="p-3">
                  {audit.changed_by_name}
                </td>


                <td className="p-3">
                  {new Date(audit.created_at).toLocaleString()}
                </td>


                <td className="p-3 text-right">

                  <button
                    onClick={() => setSelectedAudit(audit)}
                    className="text-primary cursor-pointer flex items-center gap-2"
                  >
                    <FiEye />
                    Details
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {selectedAudit && (

        <AuditViewerModal
          organisationId={organisationId}
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />

      )}

    </>
  );
}
