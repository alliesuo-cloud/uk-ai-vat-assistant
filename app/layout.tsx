import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI VAT Assistant",
  description:
    "Analyse UK purchase invoices for VAT treatment. An AI-assisted guide for junior accountants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
