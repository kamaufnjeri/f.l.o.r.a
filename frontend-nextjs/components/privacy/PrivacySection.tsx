// components/privacy/PrivacySection.tsx

export default function PrivacySection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="group bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition relative">

      {/* top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-t-2xl opacity-80" />

      {/* header */}
      <div className="flex items-start gap-3">

        <div className="mt-1 w-3 h-3 rounded-full bg-primary shrink-0" />

        <h2 className="text-lg md:text-xl font-semibold text-text">
          {title}
        </h2>
      </div>

      {/* content */}
      <p className="mt-4 text-muted text-sm md:text-base leading-relaxed">
        {content}
      </p>

      {/* footer hint */}
      <div className="mt-6 flex justify-between text-xs text-muted opacity-70 group-hover:opacity-100 transition">

        <span>Flora Privacy Clause</span>

        <span className="text-primary font-medium">
          Protected Data Policy
        </span>

      </div>

    </section>
  );
}