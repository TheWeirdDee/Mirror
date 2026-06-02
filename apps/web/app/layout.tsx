import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "Mirror Protocol",
  description: "Trustless M&A matchmaking on Story Protocol. Both sides seal their intent into CDR vaults. Identities reveal only when both parties consent — simultaneously, on-chain, with no banker in the middle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="noise-bg min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
