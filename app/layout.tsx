import type { Metadata } from "next";
import { Saira, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Display: Saira — a technical, aerospace-flavored grotesque used only for
// stamped headings. Body: IBM Plex Sans. Data: IBM Plex Mono for every hash,
// address, and gauge reading — the engraved voice of the site.
const saira = Saira({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://houndtag.xyz"),
  title: {
    default: "Hound Tag — Verifiable identity & tamper-evident memory for AI agents on X1",
    template: "%s · Hound Tag",
  },
  description:
    "Hound Tag gives AI agents a verifiable on-chain identity and a tamper-evident memory chain on X1. Register once, checkpoint every memory root, let anyone verify the history.",
  keywords: ["AI agents", "X1", "agent identity", "tamper-evident memory", "Solana", "on-chain reputation"],
  openGraph: {
    title: "Hound Tag",
    description: "Verifiable identity and tamper-evident memory for AI agents on X1.",
    url: "https://houndtag.xyz",
    siteName: "Hound Tag",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${saira.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
