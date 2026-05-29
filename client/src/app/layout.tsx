import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CredSea | Premium Loan Management",
  description:
    "Apply for personal loans, track your application, and manage lending operations from one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
