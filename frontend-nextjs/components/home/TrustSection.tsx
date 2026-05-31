export default function TrustSection() {
  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "2.5K+", label: "Businesses" },
    { value: "1K+", label: "Accountants" },
    { value: "99.9%", label: "System Uptime" },
  ];

  const companies = [
    "Acme Corp",
    "FinEdge Ltd",
    "Nova Retail",
    "LedgerWorks",
    "Prime Traders",
    "BluePeak Group",
  ];

  return (
    <section className="relative py-28 overflow-hidden bg-primary">
      
      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* BADGE */}
        <div className="text-center">
          <span className="inline-block text-xs px-4 py-1 rounded-full bg-white/20 text-white backdrop-blur">
            TRUSTED PLATFORM
          </span>

          <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-white">
            Powering modern finance teams
          </h2>

          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Thousands of businesses and accountants rely on Flora to manage
            their financial operations with confidence and precision.
          </p>
        </div>

        {/* 📊 METRICS */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="
                p-6 rounded-2xl text-center
                bg-white/10 backdrop-blur-lg
                border border-white/20
                hover:bg-white/20
                transition duration-300
              "
            >
              <h3 className="text-3xl font-semibold text-white">
                {stat.value}
              </h3>
              <p className="mt-2 text-sm text-white/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-16" />

        {/* 🏢 COMPANY NAMES */}
        <div>
          <p className="text-center text-sm text-white/70 uppercase tracking-wide">
            Used by teams at
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
            {companies.map((company) => (
              <div
                key={company}
                className="
                  text-center text-lg md:text-xl font-semibold
                  text-white/70
                  hover:text-white
                  hover:scale-105
                  transition duration-300
                "
              >
                {company}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}