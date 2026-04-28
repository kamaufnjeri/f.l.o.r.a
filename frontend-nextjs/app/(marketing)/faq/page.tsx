import FAQHero from "@/app/components/faq/FAQHero";
import FAQList from "@/app/components/faq/FaqList";
import CTA from "@/app/components/home/CTA";

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