import AboutHero from "@/components/about/AboutHero";
import Impact from "@/components/about/Impact";
import Mission from "@/components/about/Mission";
import Story from "@/components/about/Story";
import Values from "@/components/about/Values";
import WhatWeDo from "@/components/about/WhatWeDo";
import CTA from "@/components/home/CTA";

export const metadata = {
  title: "About Flora | Modern Accounting Software",
  description:
    "Flora is a modern accounting system for SMEs, accountants, and businesses that need clarity and control.",
};

export default function AboutPage() {
  return (
    <main >
      <AboutHero />
      <Mission />
      <Story />
      <WhatWeDo/>
      <Impact/>
      <Values />
      <CTA />
    </main>
  );
}