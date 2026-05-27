// components/faq/FAQHero.tsx
export default function FAQHero() {
  return (
    <section className="relative py-32 bg-bg-soft overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-primary-light blur-[160px] opacity-50 rounded-full" />
        <div className="absolute bottom-[-140px] right-1/3 w-[450px] h-[450px] bg-primary/10 blur-[140px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* badge */}
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-white border border-border shadow-sm">
          <span className="text-xs tracking-widest uppercase text-primary font-medium">
            Help Center
          </span>
        </div>

        {/* heading */}
        <h1 className="mt-8 text-4xl md:text-6xl font-semibold text-text leading-tight">
          Frequently Asked Questions
        </h1>

        {/* description */}
        <p className="mt-6 text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Everything you need to know about <span className="text-primary font-medium">Flora</span> —
          accounting workflows, inventory management, reporting, and platform security.
        </p>

      </div>
    </section>
  );
}