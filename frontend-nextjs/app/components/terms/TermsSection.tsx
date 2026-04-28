// components/terms/TermsSection.tsx

export default function TermsSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="group relative bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition">

      {/* top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/60 to-transparent rounded-t-2xl opacity-80" />

      {/* header */}
      <div className="flex items-start gap-3">

        {/* number indicator style dot */}
        <div className="mt-1 w-3 h-3 rounded-full bg-primary shrink-0" />

        <div className="flex-1">

          <h2 className="text-lg md:text-xl font-semibold text-text leading-snug">
            {title}
          </h2>

          {/* subtle divider under title */}
          <div className="mt-2 w-12 h-[2px] bg-primary/30 rounded-full" />

        </div>
      </div>

      {/* content block */}
      <div className="mt-5 space-y-4 text-sm md:text-base text-muted leading-relaxed">

        {content.split(". ").map((line, i) => (
          <p key={i} className="relative pl-4">

            {/* bullet accent */}
            <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary/60" />

            {line.trim()}
            {line.endsWith(".") ? "" : "."}
          </p>
        ))}

      </div>

      {/* footer micro interaction hint */}
      <div className="mt-6 flex items-center justify-between text-xs text-muted opacity-70 group-hover:opacity-100 transition">

        <span>Flora Legal Clause</span>

        <span className="text-primary font-medium">
          Read carefully
        </span>

      </div>

    </section>
  );
}