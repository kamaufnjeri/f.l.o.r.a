// components/Audience.tsx
import { FaUserTie, FaCalculator, FaChartLine } from "react-icons/fa";

export default function Audience() {
  const audiences = [
    {
      icon: FaUserTie,
      title: "Small Businesses",
      desc: "Manage daily operations, invoices, and cash flow with ease.",
    },
    {
      icon: FaCalculator,
      title: "Accountants",
      desc: "Maintain accurate books with structured double-entry systems.",
    },
    {
      icon: FaChartLine,
      title: "Growing SMEs",
      desc: "Scale confidently with real-time financial insights.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-bg-soft overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-light blur-[120px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* badge */}
        <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary-light text-primary">
          AUDIENCE
        </span>

        {/* heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-text">
          Built for modern financial teams
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Whether you’re a business owner or an accountant, Flora adapts to your workflow seamlessly.
        </p>

        {/* cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {audiences.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="
                group p-8 rounded-3xl bg-white
                border border-border
                shadow-sm hover:shadow-xl
                transition duration-300
                hover:-translate-y-1
                text-center
              "
            >
              {/* icon */}
              <div className="
                w-14 h-14 mx-auto flex items-center justify-center
                rounded-2xl bg-primary-light text-primary
                group-hover:scale-110 transition
              ">
                <Icon size={18} />
              </div>

              {/* title */}
              <h3 className="mt-6 text-lg font-semibold text-text">
                {title}
              </h3>

              {/* description */}
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {desc}
              </p>

              {/* hover accent */}
              <div className="mt-6 h-1 w-12 mx-auto bg-primary rounded-full opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}