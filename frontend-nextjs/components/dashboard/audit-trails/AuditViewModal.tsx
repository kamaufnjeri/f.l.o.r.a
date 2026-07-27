import Link from "next/link";
import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import { AuditData, AuditTrail } from "./types";


function ValueViewer({
  data
}: {
  data: AuditData
}) {

  return (

    <div className="rounded-xl border overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">
              Field
            </th>

            <th className="p-3 text-left">
              Value
            </th>
          </tr>
        </thead>


        <tbody className="divide-y">

          {Object.entries(data ?? {}).map(
            ([key,value]) => (

            <tr key={key}>

              <td className="
                p-3 
                font-medium 
                align-top 
                w-1/3
              ">
                {key}
              </td>


              <td className="p-3 text-gray-700">

                {typeof value === "object" && value !== null ? (

                  <details className="bg-gray-50 rounded-md p-2">

                    <summary className="cursor-pointer text-primary">
                      View details
                    </summary>

                    <pre className="
                      mt-2
                      text-xs
                      whitespace-pre-wrap
                      break-words
                      max-h-64
                      overflow-auto
                    ">
                      {JSON.stringify(value, null, 2)}
                    </pre>

                  </details>

                ) : (

                  <span className="break-words">
                    {String(value ?? "-")}
                  </span>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )
}

const modelRoutes: Record<string, string> = {
  Journal: "journals",
  Account: "accounts",
  ServiceIncome: "service-income",
  Sales: "sales",
  Purchase: "purchases",
  Customer: "customers",
  Supplier: "suppliers",
  Service: "services",
  Stock: "stocks",
};
const viewLabels: Record<string, string> = {
  Journal: "View Journal",
  Account: "View Account",
  ServiceIncome: "View Service Income",
  Sales: "View Sale",
  Purchase: "View Purchase",
  Customer: "View Customer",
  Supplier: "View Supplier",
};


export function getAuditLink(organisationId: string, model: string, id: string) {
  const route = modelRoutes[model];

  if (!route) return null;

  return `/dashboard/${organisationId}/${route}/${id}`;
}


export default function AuditViewerModal({
  audit,
  organisationId,
  onClose
}: {
  audit:AuditTrail;
  organisationId: string;
  onClose:()=>void;
}) {
    const viewLink =
    audit.action !== "DELETE"
        ? getAuditLink(
            organisationId,
            audit.model_name,
            audit.object_id
        )
        : null;



  return (

    <Modal open onClose={onClose}>



        <div className="sticky top-0 z-10 bg-white border-b  ">

  <ModalHeader
    title={`${audit.action} ${audit.model_name}`}
    description={`Changed by ${audit.changed_by_name}`}
    onClose={onClose}
  />


 

</div>


        <div className="overflow-y-auto px-5 py-6  flex flex-col gap-4">
             {viewLink && (

    <Link
      href={viewLink}
      className="
        rounded-md
        p-1
        text-sm
        text-primary
        hover:bg-primary/5
      ">
    
    {viewLabels[audit.model_name] || "View Details"}

    </Link>

  )}


          {audit.action === "EDIT" ? (

            <div className="grid grid-cols-2 gap-5">

              <div>
                <h3 className="font-semibold mb-3 text-red-600">
                  Before
                </h3>

                <ValueViewer
                  data={audit.before}
                />

              </div>


              <div>

                <h3 className="font-semibold mb-3 text-green-600">
                  After
                </h3>

                <ValueViewer
                  data={audit.after}
                />

              </div>

            </div>


          ) : (

            <ValueViewer
              data={
                audit.action === "DELETE"
                  ? audit.before
                  : audit.after
              }
            />

          )}


        </div>


    </Modal>

  )
}
