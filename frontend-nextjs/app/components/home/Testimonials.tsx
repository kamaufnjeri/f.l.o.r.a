export default function Testimonials() {
  const data = [
    {
      quote: "Flora transformed how we manage finances across our business operations.",
      name: "Jane Mwangi",
      role: "SME Owner",
    },
    {
      quote: "Accurate, clean, and incredibly easy to use for daily bookkeeping.",
      name: "CPA John",
      role: "Accountant",
    },
    {
      quote: "Inventory tracking and reporting is now completely seamless.",
      name: "Retail Manager",
      role: "Retail Business",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-bg-soft overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-light blur-[120px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* badge */}
        <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary-light text-primary">
          TESTIMONIALS
        </span>

        {/* heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-text">
          Loved by finance teams
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Businesses trust Flora to simplify accounting, improve accuracy, and save time.
        </p>

        {/* cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {data.map((t) => {
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={t.name}
                className="
                  group p-8 rounded-3xl bg-white
                  border border-border
                  shadow-sm hover:shadow-xl
                  transition duration-300
                  hover:-translate-y-1
                  text-left
                "
              >
                {/* quote mark */}
                <div className="text-primary text-3xl leading-none">“</div>

                {/* quote */}
                <p className="mt-4 text-sm text-muted leading-relaxed">
                  {t.quote}
                </p>

                {/* divider */}
                <div className="mt-6 h-px bg-border" />

                {/* user */}
                <div className="mt-6 flex items-center gap-3">
                  {/* avatar fallback */}
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-semibold text-sm">
                    {initials}
                  </div>

                  <div>
                    <p className="font-medium text-text">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>

                {/* hover accent */}
                <div className="mt-6 h-1 w-12 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}