import { Inter, Roboto_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Chimpanion - AI-Powered Agentic Wallet",
  description: "Your intelligent blockchain companion",
  keywords: ["crypto", "wallet", "AI", "DeFi", "prediction markets", "Chimpanion"],
  authors: [{ name: "Chimpanion Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Chimpanion - AI-Powered Agentic Wallet",
    description: "Your intelligent crypto wallet that understands natural language commands.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chimpanion - AI-Powered Agentic Wallet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chimpanion - AI-Powered Agentic Wallet",
    description: "Your intelligent crypto wallet that understands natural language commands.",
    images: ["/og-image.png"],
    creator: "@ChimpanionApp",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1DA1F2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
