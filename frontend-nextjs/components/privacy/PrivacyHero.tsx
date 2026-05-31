// components/privacy/PrivacyHero.tsx

export default function PrivacyHero() {
  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary-light blur-[180px] opacity-60 rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-muted">
            Privacy & Security
          </span>
        </div>

        {/* title */}
        <h1 className="mt-7 text-4xl md:text-5xl font-semibold text-text leading-tight">
          Privacy Policy
        </h1>

        {/* subtitle */}
        <p className="mt-5 text-muted max-w-2xl mx-auto text-lg leading-relaxed">
          Your data security and transparency are at the core of Flora. This policy
          explains how we handle, protect, and manage your financial information.
        </p>

        {/* trust badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-muted">
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            End-to-End Encryption
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            GDPR Conscious Design
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-border">
            SME Focused Security
          </span>
        </div>

      </div>
    </section>
  );
}