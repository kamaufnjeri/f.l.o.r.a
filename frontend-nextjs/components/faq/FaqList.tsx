import FAQItem from "./FAQItem";

export default function FAQList() {
  const faqs = [
    {
      q: "What is Flora?",
      a: "Flora is a modern accounting system for SMEs and accountants designed to simplify bookkeeping, automate reporting, and manage financial operations in one platform.",
    },
    {
      q: "Does Flora support double-entry accounting?",
      a: "Yes. Flora is built on a structured double-entry accounting system ensuring accuracy and audit-ready financial records.",
    },
    {
      q: "Can I manage inventory in Flora?",
      a: "Yes. Flora supports inventory tracking using weighted average costing for accurate stock valuation.",
    },
    {
      q: "Is my financial data secure?",
      a: "Absolutely. All data is encrypted and protected with modern security practices to ensure business-grade safety.",
    },
    {
      q: "Who is Flora built for?",
      a: "Flora is designed for SMEs, accountants, business owners, and finance teams who need structured and reliable accounting tools.",
    },
    {
      q: "Can I generate financial reports?",
      a: "Yes. You can generate profit & loss statements, balance sheets, and other financial reports instantly.",
    },
  ];

  return (
    <section className="relative py-28 bg-bg-soft overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-light blur-[160px] opacity-40 rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">

        {/* header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs px-4 py-1 rounded-full bg-primary-light text-primary uppercase tracking-wider">
            Support
          </span>

          <h2 className="mt-6 text-3xl md:text-4xl font-semibold text-text">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-muted max-w-2xl mx-auto leading-relaxed">
            Clear answers to the most common questions about Flora —
            designed to help you get started quickly and confidently.
          </p>
        </div>

        {/* faq list */}
        <div className="space-y-4 md:space-y-5">
          {faqs.map((f) => (
            <FAQItem key={f.q} question={f.q} answer={f.a} />
          ))}
        </div>

        {/* bottom support hint */}
        <div className="mt-14 text-center">
          <p className="text-sm text-muted">
            Still have questions? Contact our support team for help.
          </p>
        </div>

      </div>
    </section>
  );
}