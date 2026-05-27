// components/terms/TermsHero.tsx

export default function TermsHero() {
  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-light blur-[180px] opacity-60 rounded-full" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-secondary/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-muted">
            Legal Document
          </span>
        </div>

        {/* title */}
        <h1 className="mt-7 text-4xl md:text-5xl font-semibold text-text leading-tight">
          Terms of Service
        </h1>

        {/* subtitle */}
        <p className="mt-5 text-muted max-w-2xl mx-auto text-lg leading-relaxed">
          These Terms define how Flora is used — ensuring transparency, trust, and
          security across all accounting operations, financial records, and user interactions.
        </p>

        {/* meta trust line */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-muted">
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            Updated 2026
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            Global Usage Terms
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            SME & Accountant Focused
          </span>
        </div>

      </div>
    </section>
  );
}