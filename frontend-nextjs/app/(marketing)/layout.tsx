import { getCurrentUser } from "@/lib/auth";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { redirect } from "next/navigation";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const user = await getCurrentUser();


    if (user && !user?.current_organisation?.id) {
      redirect("/dashboard/organisation-create");
    }

  return (
    <div className="flex flex-col min-h-screen">

      {/* HEADER (marketing only) */}
      <Header user={user}/>

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER (marketing only) */}
      <Footer/>

    </div>
  );
}