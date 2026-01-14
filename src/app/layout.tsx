import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salesforce Mock - Customer Management",
  description: "A premium customer data and service management application",
};

import { LoadingProvider } from "@/context/LoadingContext";
import { DataProvider } from "@/context/DataContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-slate-50/30`}>
        <LoadingProvider>
          <DataProvider>
            <Navbar />
            <main>
              {children}
            </main>
          </DataProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
