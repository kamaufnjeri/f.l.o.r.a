import { FaBolt, FaShieldAlt, FaCloud } from "react-icons/fa";

export default function Features() {
  const items = [
    {
      icon: FaBolt,
      title: "Real-time Insights",
      desc: "Track revenue, expenses, and cash flow instantly with live dashboards.",
    },
    {
      icon: FaShieldAlt,
      title: "Enterprise-grade Security",
      desc: "Your financial data is encrypted, backed up, and fully protected.",
    },
    {
      icon: FaCloud,
      title: "Cloud-based Access",
      desc: "Access your accounting system anywhere, anytime, on any device.",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-(--bg-soft) overflow-hidden">

      {/* 🔥 subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-light blur-[120px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* 🏷 badge */}
        <span className="inline-block text-xs px-4 py-1 rounded-full bg-(--primary-light) text-primary">
          FEATURES
        </span>

        {/* 🧠 heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-(--text)">
          Everything you need to run your finances
        </h2>

        <p className="mt-4 text-(--muted) max-w-2xl mx-auto">
          Built for modern businesses that demand accuracy, speed, and control over their financial operations.
        </p>

        {/* 💎 feature cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="
                group p-8 rounded-3xl
                bg-white border border-(--border)
                shadow-sm hover:shadow-xl
                transition duration-300
                hover:-translate-y-1
              "
            >
              {/* ICON */}
              <div className="
                w-14 h-14 mx-auto flex items-center justify-center
                rounded-2xl
                bg-(--primary-light)
                text-primary
                group-hover:scale-110
                transition
              ">
                <Icon size={20} />
              </div>

              {/* TITLE */}
              <h3 className="mt-6 text-lg font-semibold text-(--text)">
                {title}
              </h3>

              {/* DESC */}
              <p className="mt-3 text-sm text-(--muted) leading-relaxed">
                {desc}
              </p>

              {/* subtle bottom accent */}
              <div className="mt-6 h-1 w-10 mx-auto bg-primary rounded-full opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}