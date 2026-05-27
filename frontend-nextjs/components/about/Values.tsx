import { FaLock, FaUsers, FaRocket } from "react-icons/fa";

export default function Values() {
  const values = [
    {
      icon: FaLock,
      title: "Security First",
      desc: "Your financial data is encrypted, backed up, and protected with enterprise-grade security standards.",
    },
    {
      icon: FaUsers,
      title: "User-Centric Design",
      desc: "Built for accountants, SMEs, and founders with real workflows, not theoretical systems.",
    },
    {
      icon: FaRocket,
      title: "High Performance",
      desc: "Optimized for speed, scale, and reliability across all financial operations.",
    },
  ];

  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-light blur-[140px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary-light text-primary uppercase tracking-wider">
            Values
          </span>

          <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-text">
            Our Core Values
          </h2>

          <p className="mt-4 text-muted leading-relaxed">
            The principles that guide how Flora is built — secure, scalable,
            and focused on real-world financial workflows.
          </p>
        </div>

        {/* cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">

          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="
                group relative p-8 rounded-3xl
                bg-white border border-border
                shadow-sm hover:shadow-xl
                transition duration-300
                hover:-translate-y-1
                overflow-hidden
              "
            >

              {/* hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-primary/5 to-transparent" />

              {/* icon */}
              <div
                className="
                  relative w-12 h-12 flex items-center justify-center
                  rounded-xl bg-primary-light text-primary
                  group-hover:bg-primary group-hover:text-white
                  transition
                "
              >
                <Icon />
              </div>

              {/* title */}
              <h3 className="relative mt-6 text-lg font-semibold text-text">
                {title}
              </h3>

              {/* description */}
              <p className="relative mt-3 text-sm text-muted leading-relaxed">
                {desc}
              </p>

              {/* bottom accent */}
              <div className="relative mt-6 h-1 w-12 rounded-full bg-primary opacity-30 group-hover:opacity-100 transition" />

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}