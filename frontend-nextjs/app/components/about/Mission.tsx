import { FaBullseye, FaLightbulb, FaChartLine } from "react-icons/fa";

export default function Mission() {
  const items = [
    {
      icon: FaBullseye,
      title: "Mission",
      desc: "Make accounting simple, accessible, and accurate for every business.",
    },
    {
      icon: FaLightbulb,
      title: "Vision",
      desc: "A world where financial management is effortless, automated, and intelligent.",
    },
    {
      icon: FaChartLine,
      title: "Goal",
      desc: "Help businesses grow through real-time financial clarity and insights.",
    },
  ];

  return (
    <section className="py-24 bg-bg-soft relative overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        {/* HEADER */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Purpose that drives <span className="text-primary">FLORA</span>
        </h2>

        <p className="mt-4 text-muted max-w-2xl mx-auto leading-relaxed">
          We are building the financial operating system for modern businesses —
          combining simplicity, automation, and accuracy.
        </p>

        {/* CARDS */}
        <div className="mt-14 grid md:grid-cols-3 gap-6 text-left">

          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative p-8 rounded-2xl bg-white border border-border
              hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >

              {/* ICON */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl
                bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white
                transition">
                <Icon />
              </div>

              {/* TITLE */}
              <h3 className="mt-6 font-semibold text-lg text-text group-hover:text-primary transition">
                {title}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-3 text-sm text-muted leading-relaxed">
                {desc}
              </p>

              {/* subtle bottom accent line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-b-2xl" />
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}