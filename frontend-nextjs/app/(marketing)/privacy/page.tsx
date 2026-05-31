// app/(marketing)/privacy/page.tsx

import PrivacyHero from "@/components/privacy/PrivacyHero";
import PrivacySection from "@/components/privacy/PrivacySection";


export const metadata = {
  title: "Privacy Policy | Flora Accounting System",
  description:
    "Learn how Flora collects, uses, and protects your data. Transparent privacy practices for SMEs, accountants, and businesses.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-bg">
      <PrivacyHero />

      <section className="max-w-4xl mx-auto px-6 py-20 space-y-10">
        <PrivacySection
          title="1. Overview"
          content="Flora (Financial Ledgers and Operations Report Analysis) values your privacy. This Privacy Policy explains how we collect, use, and protect your personal and business data when you use our platform."
        />

        <PrivacySection
          title="2. Data We Collect"
          content="We collect information such as account details, financial records, invoices, transactions, and system usage data to provide accurate accounting and reporting services."
        />

        <PrivacySection
          title="3. How We Use Data"
          content="Your data is used to power accounting features, generate reports, improve system performance, and ensure secure access to your financial information."
        />

        <PrivacySection
          title="4. Data Protection"
          content="We use encryption, secure storage systems, and access control mechanisms to protect your financial data from unauthorized access or misuse."
        />

        <PrivacySection
          title="5. Data Sharing"
          content="We do not sell your data. Data is only shared with trusted service providers when necessary to operate the platform or comply with legal obligations."
        />

        <PrivacySection
          title="6. User Rights"
          content="You may request access, correction, or deletion of your personal data at any time, subject to legal and operational requirements."
        />

        <PrivacySection
          title="7. Updates to This Policy"
          content="We may update this Privacy Policy from time to time. Continued use of Flora means you accept the updated terms."
        />
      </section>
    </main>
  );
}