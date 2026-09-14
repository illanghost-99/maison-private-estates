import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/ai/chat-widget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maison Private Estates | Exklusiv Fastighetsförmedling",
  description:
    "Premium fastighetsmäklare i Stockholm. Exklusiva bostäder på Östermalm, Vasastan, Djursholm och mer. Personlig service och marknadsexpertis.",
  keywords: [
    "fastighetsmäklare",
    "Stockholm",
    "Östermalm",
    "lyxbostäder",
    "villa",
    "lägenhet",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
