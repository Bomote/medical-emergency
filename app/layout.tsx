import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from "next/font/google"
import OfflineIndicator from "@/components/OfflineIndicator"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Emergency Medicine Reference",
  description:
    "Comprehensive emergency medicine reference with clinical decision support tools, dosage calculators, and offline access for critical care situations.",
  generator: "v0.app",
  applicationName: "Emergency Medicine Reference",
  referrer: "origin-when-cross-origin",
  keywords: [
    "emergency medicine",
    "clinical reference",
    "medical calculator",
    "dosage calculator",
    "clinical decision support",
  ],
  authors: [{ name: "Emergency Medicine Team" }],
  creator: "Emergency Medicine Team",
  publisher: "Emergency Medicine Reference",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://emergency-reference.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Emergency Medicine Reference",
    description: "Comprehensive emergency medicine reference with clinical decision support tools",
    url: "https://emergency-reference.vercel.app",
    siteName: "Emergency Medicine Reference",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergency Medicine Reference",
    description: "Comprehensive emergency medicine reference with clinical decision support tools",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ER Reference",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  // Move viewport config into metadata
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // themeColor should be separate from viewport when inside metadata
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dc2626" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/medical-emergency-icon.png" />
        <link rel="apple-touch-icon" href="/medical-emergency-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <OfflineIndicator />
      </body>
    </html>
  )
}