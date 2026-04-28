import AboutHero from "@/app/components/about/AboutHero";
import Impact from "@/app/components/about/Impact";
import Mission from "@/app/components/about/Mission";
import Story from "@/app/components/about/Story";
import Values from "@/app/components/about/Values";
import WhatWeDo from "@/app/components/about/WhatWeDo";
import CTA from "@/app/components/home/CTA";

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