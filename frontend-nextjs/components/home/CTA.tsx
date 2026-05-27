// components/CTA.tsx
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 text-center bg-primary text-white">
      <h2 className="text-3xl font-bold">
        Take control of your finances
      </h2>

      <p className="mt-4 text-primary-light">
        Start using Flora today.
      </p>

      <Link
        href="/login"
        className="mt-8 inline-block px-6 py-3 bg-white text-primary rounded-xl font-medium"
      >
        Get Started
      </Link>
    </section>
  );
}