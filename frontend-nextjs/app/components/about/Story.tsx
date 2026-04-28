export default function Story() {
  return (
    <section className="py-28 bg-bg relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* HEADER */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Why <span className="text-primary">FLORA</span> exists
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto leading-relaxed">
          Built to replace fragmented spreadsheets and outdated accounting tools
          with a modern financial operating system for businesses.
        </p>

        {/* STORY CONTENT */}
        <div className="mt-14 text-left space-y-8">

          <div className="p-6 md:p-8 rounded-2xl bg-bg-soft border border-border hover:shadow-md transition">
            <h3 className="font-semibold text-primary text-lg">
              The Problem
            </h3>
            <p className="mt-3 text-muted leading-relaxed">
              Most small and medium businesses rely on spreadsheets or overly
              complex accounting systems that slow down operations instead of
              improving them. This leads to errors, inefficiencies, and poor
              financial visibility.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-white border border-border hover:shadow-md transition">
            <h3 className="font-semibold text-primary text-lg">
              The Solution
            </h3>
            <p className="mt-3 text-muted leading-relaxed">
              Flora was created to solve this by combining accounting structure,
              automation, and simplicity into one unified system designed for real
              business workflows.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-bg-soft border border-border hover:shadow-md transition">
            <h3 className="font-semibold text-primary text-lg">
              The Outcome
            </h3>
            <p className="mt-3 text-muted leading-relaxed">
              Instead of scattered financial records, businesses get a centralized
              platform where every transaction is properly recorded, categorized,
              and analyzed in real time — enabling better decisions and stronger
              financial control.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}