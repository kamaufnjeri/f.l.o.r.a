export default function AboutHero() {
  return (
    <section className="relative overflow-hidden py-28 bg-bg">

      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(109,40,217,0.08),transparent_60%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">

        {/* LABEL */}
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          About Flora
        </p>

        {/* TITLE */}
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
          Financial clarity for <span className="text-primary">modern businesses</span>
        </h1>

        {/* SUBTITLE */}
        <p className="mt-6 text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Flora is a modern accounting system designed for SMEs, accountants, and
          finance teams to simplify bookkeeping, automate reporting, and centralize
          financial control in one intelligent platform.
        </p>

        {/* HIGHLIGHT CARDS */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-muted">
          <span className="px-4 py-2 rounded-full bg-bg-soft border border-border">
            Double-entry accounting
          </span>
          <span className="px-4 py-2 rounded-full bg-bg-soft border border-border">
            Real-time reporting
          </span>
          <span className="px-4 py-2 rounded-full bg-bg-soft border border-border">
            Inventory tracking
          </span>
          <span className="px-4 py-2 rounded-full bg-bg-soft border border-border">
            Invoice automation
          </span>
        </div>

        {/* BRAND MEANING CARD */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition text-left overflow-hidden">

          {/* top accent bar */}
          <div className="h-1 bg-primary" />

          <div className="p-8">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">
                F.L.O.R.A
              </h2>

              <span className="text-xs text-muted bg-bg-soft px-3 py-1 rounded-full border border-border">
                Acronym
              </span>
            </div>

            <p className="mt-3 text-text font-medium">
              Financial Ledgers and Operations Report Analysis
            </p>

            <p className="mt-4 text-muted text-sm leading-relaxed">
              A web-based accounting and bookkeeping platform built to streamline
              financial operations for small and medium enterprises. Flora enables
              accurate transaction recording, structured reporting, and real-time
              financial insights that improve decision-making and financial control.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}