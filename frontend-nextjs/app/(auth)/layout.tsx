import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col max-h-screen h-screen ">

      {/* HEADER (marketing only) */}

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {children}
      </main>

    </div>
  );
}