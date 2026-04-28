// app/(marketing)/terms/page.tsx

import TermsHero from "@/app/components/terms/TermsHero";
import TermsSection from "@/app/components/terms/TermsSection";

export const metadata = {
  title: "Terms of Service | Flora Accounting System",
  description:
    "Read Flora’s Terms of Service covering usage, responsibilities, data handling, and platform rules for SMEs and accountants.",
};

export default function TermsPage() {
  return (
    <main className="bg-bg">
      <TermsHero />

      <section className="max-w-4xl mx-auto px-6 py-20 space-y-10">
        <TermsSection
          title="1. Introduction"
          content="Flora (Financial Ledgers and Operations Report Analysis) is a financial management system designed for SMEs, accountants, and businesses. By using Flora, you agree to comply with these Terms of Service."
        />

        <TermsSection
          title="2. Use of the Platform"
          content="You agree to use Flora only for lawful business accounting purposes. You are responsible for all data entered, including invoices, purchases, sales, and financial records."
        />

        <TermsSection
          title="3. Account Responsibilities"
          content="You are responsible for maintaining the confidentiality of your account credentials and all activities under your account."
        />

        <TermsSection
          title="4. Data & Security"
          content="We implement industry-standard security measures. However, users are responsible for ensuring their internal data handling practices are secure."
        />

        <TermsSection
          title="5. Service Availability"
          content="We strive for 99.9% uptime but do not guarantee uninterrupted access due to maintenance, updates, or unforeseen issues."
        />

        <TermsSection
          title="6. Termination"
          content="We reserve the right to suspend or terminate accounts that violate our policies or misuse the platform."
        />

        <TermsSection
          title="7. Changes to Terms"
          content="Flora may update these Terms periodically. Continued use of the platform constitutes acceptance of updated terms."
        />
      </section>
    </main>
  );
}