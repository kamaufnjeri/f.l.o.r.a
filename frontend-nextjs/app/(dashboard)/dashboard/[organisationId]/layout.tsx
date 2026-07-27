import { getCurrentUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import ModalRenderer from "@/components/dashboard/layout/ModalRenderer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   

  return (

     <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <ModalRenderer/>
      </div>

  );
}