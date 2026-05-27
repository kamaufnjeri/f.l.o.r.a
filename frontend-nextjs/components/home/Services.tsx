// components/home/Services.tsx
import { FaFileInvoice, FaBoxes, FaChartPie } from "react-icons/fa";

export default function Services() {
  const services = [
    {
      icon: FaFileInvoice,
      title: "Invoices & Billing",
      desc: "Get paid faster with automated invoicing and real-time payment tracking.",
    },
    {
      icon: FaBoxes,
      title: "Inventory Management",
      desc: "Never run out of stock or overstock again with live inventory insights.",
    },
    {
      icon: FaChartPie,
      title: "Financial Reporting",
      desc: "Understand your business instantly with clear, real-time financial dashboards.",
    },
  ];

  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/3 w-[420px] h-[420px] bg-primary/20 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary/10 text-primary font-medium">
          SERVICES
        </span>

        <h2 className="mt-6 text-3xl md:text-5xl font-semibold text-text">
          Everything you need to run your business finances
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Simple, powerful tools that replace spreadsheets and manual bookkeeping.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-8">

          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-8 rounded-3xl bg-white border border-border
              shadow-sm hover:shadow-2xl hover:-translate-y-2 transition text-left"
            >

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
                <Icon size={18} />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-text">
                {title}
              </h3>

              <p className="mt-3 text-sm text-muted leading-relaxed">
                {desc}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}