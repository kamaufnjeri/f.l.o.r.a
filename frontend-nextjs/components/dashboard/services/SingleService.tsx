import { ServiceDetails } from "@/types"
import Link from "next/link"
import { FiEye } from "react-icons/fi"
import ServiceDropDown from "./ServiceDropDown";

type Props = {
    organisationId: string;
    service: ServiceDetails;
    date: string;
}

export function SingleService({ service, organisationId, date }: Props) {
  return (
  <div className="w-full space-y-4">

  {/* SERVICE HEADER CARD */}
  <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <span>
          <strong className="text-gray-900">Name:</strong>{" "}
          {service.name}
        </span>

        <span>
          <strong className="text-gray-900 col-span-2 md:col-span-1">Description:</strong>{" "}
          {service.description || "-"}
        </span>
       
      </div>
       <ServiceDropDown
        service={service}
        organisationId={organisationId}
        date={date}
      />
    </div>
  </div>

  {/* TABLE CARD */}
  <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
    <div className="overflow-x-auto">

      <table className="w-full min-w-[1100px] text-sm">

        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
          <tr className="border-b">
            <th className="p-3 text-left font-medium">
              Service Income #
            </th>

            <th className="p-3 text-left font-medium">
              Date
            </th>

            <th className="p-3 text-left font-medium">
              Description
            </th>

            <th className="p-3 text-right font-medium">
              Quantity
            </th>

            <th className="p-3 text-right font-medium">
              Rate 
            </th>

            <th className="p-3 text-right font-medium">
              Total
            </th>

            <th className="p-3 text-right font-medium">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">

          {service.service_data?.entries.map((entry, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition"
            >
              <td className="p-3 text-gray-700">
                {entry.details.serial_number}
              </td>

              <td className="p-3 text-gray-700">
                {entry.details.date}
              </td>

              <td className="p-3 text-gray-700">
                {entry.details.description}
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {entry.quantity}
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {entry.price}
              </td>

              <td className="p-3 text-right tabular-nums font-medium text-gray-900">
                {entry.details.total}
              </td>

              <td className="p-3 text-right">
                {entry.details.url && (
                  <Link
                    href={`/dashboard/${organisationId}${entry.details.url}`}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-primary
                      hover:text-primary-dark
                      transition
                      px-2
                      py-1
                      rounded-md
                      hover:bg-primary/5
                    "
                  >
                    <FiEye className="text-base" />
                    <span>View</span>
                  </Link>
                )}
              </td>
            </tr>
          ))}

          {/* TOTAL */}
          <tr className="bg-gray-100 font-semibold">
            <td colSpan={5} className="p-3 text-gray-800">
              Total
            </td>

            <td className="p-3 text-right tabular-nums">
              {service.service_data?.total}
            </td>

            <td />
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</div>
  )
}

export default SingleService
