// app/(marketing)/contact/page.tsx

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";

export const metadata = {
  title: "Contact Flora | Support & Partnerships",
  description:
    "Get in touch with Flora for support, partnerships, or product inquiries. We’re here to help you streamline accounting and financial operations.",
};

export default function ContactPage() {
  return (
    <main className="bg-bg">
      <ContactHero />
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12">
        <ContactForm />
        <ContactInfo />
      </section>
    </main>
  );
}