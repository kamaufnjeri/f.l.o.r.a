import Link from "next/link";
import { FiEye } from "react-icons/fi";


type Service = {
  id: number;
  name: string;
  description: string;
 
};

export default function ServicesTable({
  services,
}: {
  services: Service[];

}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr className="border-b">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Description</th>
           
            </tr>
          </thead>

          <tbody className="divide-y">
            {services.map((service) => (
              
                <tr
                key={service.id}
                className="hover:bg-gray-50 transition"
                >
                
                <td className="p-3 text-gray-800">
                    {service.name}
                </td>

                <td className="p-3 text-gray-800">
                    {service.description}
                </td>
                

               
                {/* DESCRIPTION ROW */}
                <td className="text-right">
                <Link
                    href={`services/${service.id}`}
                    className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-primary
                    hover:text-primary-dark
                    transition
                    cursor-pointer
                    px-2 py-1
                    rounded-md
                    hover:bg-primary/5
                    "
                >
                    <FiEye className="text-base" />
                    <span>View</span>
                </Link>
                </td>                
                </tr>
             
            ))}

            
          </tbody>
        </table>
      </div>
    </div>
  );
}