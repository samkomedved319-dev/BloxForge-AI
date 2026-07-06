import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/bloxforge/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BloxForge AI — NVIDIA-Powered Roblox Coding Companion",
  description:
    "BloxForge AI is the NVIDIA-powered AI coding companion for Roblox developers. Generate, debug and refactor Luau with frontier models — plus a free Roblox Studio plugin.",
  keywords: [
    "Roblox AI",
    "Luau AI",
    "Roblox code generator",
    "NVIDIA AI",
    "Roblox Studio plugin",
    "BloxForge",
    "lemonade.gg alternative",
  ],
  authors: [{ name: "BloxForge AI" }],
  openGraph: {
    title: "BloxForge AI — NVIDIA-Powered Roblox Coding Companion",
    description:
      "Generate, debug and refactor Luau with NVIDIA frontier models. Free Roblox Studio plugin included.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloxForge AI",
    description:
      "NVIDIA-powered AI coding companion for Roblox developers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
