import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/react";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bracket Ranker - Free Bracket Maker and Ranking Generator",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Create bracket-style rankings for movies, music, food, sports, TV, games, and custom lists. Pick winners head-to-head and share your final top list.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <TooltipProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <Toaster />
          <Analytics />
        </TooltipProvider>
      </body>
    </html>
  );
}
