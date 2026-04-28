// components/about/WhatWeDo.tsx
import { FaFileInvoice, FaBoxes, FaChartPie, FaExchangeAlt } from "react-icons/fa";

export default function WhatWeDo() {
  const features = [
    {
      icon: FaFileInvoice,
      title: "Invoice Lifecycle Management",
      desc: "Tracks every invoice from creation to payment using a structured accounting workflow with audit readiness.",
    },
    {
      icon: FaBoxes,
      title: "Inventory Accounting System",
      desc: "Uses weighted average costing to ensure accurate stock valuation and financial consistency.",
    },
    {
      icon: FaExchangeAlt,
      title: "Sales & Purchase Recording",
      desc: "All transactions are recorded through a double-entry system for full financial integrity.",
    },
    {
      icon: FaChartPie,
      title: "Automated Financial Reports",
      desc: "Generates profit & loss, balance sheets, and performance reports without manual calculation.",
    },
  ];

  return (
    <section className="py-28 bg-bg">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-text">
            How Flora works behind the scenes
          </h2>

          <p className="mt-4 text-muted">
            Flora is not just a tool — it is a structured accounting system designed around real financial principles.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">

          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-7 rounded-2xl bg-white border border-border
              hover:border-primary/40 hover:shadow-lg transition"
            >

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
                <Icon size={18} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-text">
                {title}
              </h3>

              <p className="mt-2 text-sm text-muted leading-relaxed">
                {desc}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}