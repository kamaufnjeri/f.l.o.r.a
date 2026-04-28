// page.tsx

import Audience from "../components/home/Audience";
import CTA from "../components/home/CTA";
import Features from "../components/home/Features";
import Hero from "../components/home/Hero";
import Services from "../components/home/Services";
import Testimonials from "../components/home/Testimonials";
import TrustSection from "../components/home/TrustSection";

export const metadata = {
  title: "Home Flora | Modern Accounting Software",
  description:
    "Flora is a modern accounting system for SMEs, accountants, and businesses that need clarity and control.",
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustSection />
      <Features />
      <Services />
      <Audience />
      <Testimonials />
      <CTA />
    </main>
  );
}