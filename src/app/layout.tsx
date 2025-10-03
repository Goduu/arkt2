// Metadata type import removed to avoid Next.js type mismatch in this setup
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ArkT - Free Sketch-Style System Diagram Tool with AI & GitHub Integration",
  description: "Create multi-level, sketchy architecture diagrams, link with GitHub, explore impacts with AI, all privately in your browser. Free to use.",
  openGraph: {
    title: "ArkT - Free Sketch-Style System Diagram Tool with AI & GitHub Integration",
    description: "Create multi-level, sketchy architecture diagrams, link with GitHub, explore impacts with AI, all privately in your browser. Free to use.",
    images: ["/arkt-home.png"],
  },
  appleWebApp: {
    title: "ArkT - Free Sketch-Style System Diagram Tool with AI & GitHub Integration",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/arkt-home.png"],
    title: "ArkT - Free Sketch-Style System Diagram Tool with AI & GitHub Integration",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
  applicationName: "ArkT",
  authors: [{ name: "Goduu", url: "https://github.com/goduu" }],
  creator: "Goduu",
  publisher: "Goduu",
  category: "productivity",
  keywords: ["system diagram", "free", "architecture diagram", "sketch", "ai", "github", "arkt", "arkt.ink"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://arkt.ink",
  },
  manifest: "/manifest.json",
} satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sketch-style system diagrams with AI & GitHub | ArkT</title>
        <meta name="description" content="Create multi-level, sketchy architecture diagrams, link with GitHub, explore impacts with AI, all privately in your browser. Free to use."></meta>
        <link rel="canonical" href="https://arkt.ink/"></link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ArkT",
              "url": "https://arkt.ink",
              "applicationCategory": "DiagrammingTool",
              "operatingSystem": "Web",
              "sameAs": [
                "https://github.com/goduu",
                "https://linkedin.com/in/igor-cangussu/",
              ],
              "description":
                "In ArkT, you can create multi-level, sketchy architecture diagrams, link with GitHub, explore impacts with AI, all privately in your browser. Free to use.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Analytics />
        <SpeedInsights />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

