// components/contact/ContactHero.tsx

export default function ContactHero() {
  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-primary-light blur-[170px] opacity-50 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary-light text-primary uppercase tracking-widest">
          Contact Support
        </span>

        <h1 className="mt-6 text-4xl md:text-5xl font-semibold text-text leading-tight">
          Let’s build better financial systems together
        </h1>

        <p className="mt-5 text-muted max-w-2xl mx-auto text-lg leading-relaxed">
          Whether you need technical support, product guidance, or partnership
          opportunities — our team is ready to help you scale your financial operations.
        </p>

      </div>
    </section>
  );
}