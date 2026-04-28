import "./globals.css";

export const metadata = {
  title: "Flora - Accounting System for SMEs",
  description:
    "Modern accounting system for invoices, ledgers, stock, purchases and financial reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}