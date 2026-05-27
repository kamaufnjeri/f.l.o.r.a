import FAQHero from "@/components/faq/FAQHero";
import FAQList from "@/components/faq/FaqList";
import CTA from "@/components/home/CTA";

export const metadata = {
  title: "FAQ | Flora Accounting System",
  description:
    "Find answers about Flora — accounting, invoices, inventory, reporting, and security.",
};

export default function FAQPage() {
  return (
    <main>
      <FAQHero />
      <FAQList />
      <CTA/>
    </main>
  );
}