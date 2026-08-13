import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono, Press_Start_2P, Barlow } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from 'sonner';
import { GameNav } from "@/components/layout/GameNav";

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const barlow = Barlow({
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "DeckDojo",
  description: "Tactical Zen Esports Training",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${jetbrainsMono.variable} ${pressStart2P.variable} ${barlow.variable}`}>
      <body className="antialiased bg-[#0B0C10] text-white">
        <QueryProvider>
          <GameNav />
          {children}
          <Toaster position="top-center" theme="dark" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
