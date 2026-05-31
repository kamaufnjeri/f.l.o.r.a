import Link from "next/link";
import { FaChartLine } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-white to-secondary-light opacity-70" />

      <div className="relative max-w-7xl mx-auto py-24 md:py-32 text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
          <FaChartLine size={12} />
          Built for modern finance teams
        </div>

        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Smart Accounting for
          <span className="block text-primary">Growing Businesses</span>
        </h1>

        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          Manage invoices, inventory, and financial reporting with real-time
          insights and full double-entry accuracy.
        </p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition shadow-md hover:shadow-lg active:scale-95"
          >
            Get Started
          </Link>

          <Link
            href="/about"
            className="px-6 py-3 rounded-xl border border-border hover:border-primary hover:text-primary transition"
          >
            Learn More
          </Link>
        </div>

        {/* TRUST MICROCOPY */}
        <p className="mt-6 text-xs text-muted">
          No credit card required • Setup in minutes
        </p>

      </div>
    </section>
  );
}