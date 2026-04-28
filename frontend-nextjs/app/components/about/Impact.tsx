export default function Impact() {
  const stats = [
    { value: "10K+", label: "Transactions processed" },
    { value: "2.5K+", label: "Businesses supported" },
    { value: "1K+", label: "Accountants onboarded" },
    { value: "99.9%", label: "System reliability" },
  ];

  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-light blur-[140px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* badge */}
        <span className="inline-block text-xs tracking-wider uppercase px-4 py-1 rounded-full bg-primary-light text-primary font-medium">
          Impact
        </span>

        {/* heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-text">
          Built for real business impact
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto leading-relaxed">
          Trusted by growing businesses, accountants, and finance teams to
          manage accounting operations with accuracy, speed, and confidence.
        </p>

        {/* stats grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">

          {stats.map((s) => (
            <div
              key={s.label}
              className="
                group relative p-8 rounded-3xl
                bg-white border border-border
                shadow-sm hover:shadow-xl
                transition duration-300
                hover:-translate-y-1
                overflow-hidden
              "
            >

              {/* subtle hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-primary/5 to-transparent" />

              {/* value */}
              <h3 className="relative text-3xl md:text-4xl font-semibold text-primary">
                {s.value}
              </h3>

              {/* label */}
              <p className="relative mt-2 text-sm text-muted">
                {s.label}
              </p>

              {/* bottom accent line */}
              <div className="relative mt-5 mx-auto w-10 h-[3px] rounded-full bg-primary opacity-30 group-hover:opacity-100 transition" />
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}