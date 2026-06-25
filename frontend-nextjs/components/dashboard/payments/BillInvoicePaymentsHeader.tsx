"use client";

import { downloadListPdf } from "@/app/actions/download-actions";
import { saveFile } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";


type Props = {
  page: string | number;
  title: string;
  downloadType: string;

};

// function formatDate(date: string) {
//   return new Date(date).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// const labelMap: Record<string, string> = {
//   search: "Search",
//   sort_by: "Sort",
//   date: "Date",
//   page: "Page",
// };


export default function BillInvoicePaymentsHeader({
  page,
  title,
  downloadType, 
}: Props) {
  const { currentOrg } = useAuthStore();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });



  const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");

    try {
      if (!currentOrg?.id) {
        toast.error("Organisation id required", { id: toastId });
        return;
      }

      const res = await downloadListPdf(
        currentOrg.id,
        { page: 1 },
        title,
        downloadType
      );

      if (res.success) {
        saveFile(res.blob, `${title}.pdf`);

        toast.success("Downloaded successfully", {
          id: toastId,
        });
      } else {
        toast.error("Download failed", { id: toastId });
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed", { id: toastId });
    }
  };

  

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

      {/* HEADER */}
      <div className="p-4 text-center bg-gradient-to-b from-gray-50 to-white">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
          {currentOrg?.org_name || "Organisation"}
        </p>

        <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          {title} ({currentOrg?.currency})
        </h2>
           <p className="mt-1 sm:mt-2 text-sm text-gray-500">
          {`As at ${today}`}
        </p>
          
       
      </div>

     
        <div className="border-t bg-gray-50 flex flex-wrap ites-center justify-between gap-4 px-4 sm:px-6 py-4 space-y-3">

            
                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    bg-white
                    border border-gray-100
                    px-3 py-1.5
                    text-xs font-medium
                    text-gray-700
                    shadow-sm
                    transition
                    hover:border-gray-200
                    hover:shadow-md
                  "
                >
                  <span className="text-gray-400 capitalize">
                    Page:
                  </span>

                  <span className="text-gray-900">
                    {page}
                  </span>
                  </div>

              <button
                onClick={handleDownload}
                className="
                  w-full sm:w-auto
                  rounded-xl
                  bg-primary
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  transition
                  cursor-pointer
                  hover:bg-primary-dark
                  active:scale-[0.98]
                "
              >
                Download PDF
              </button>
             

         
        </div>
     
    </div>

  );
}