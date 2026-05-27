import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">

      {/* HEADER (marketing only) */}
      <Header />

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER (marketing only) */}
      <Footer/>

    </div>
  );
}