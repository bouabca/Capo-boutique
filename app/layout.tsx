import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { RootContent } from "@/components/root-content"
import { LanguageProvider } from "@/components/LanguageProvider"
import FacebookPixel from "@/components/FacebookPixel"
import Image from "next/image"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const metadata: Metadata = {
  title: "capoboutique",
  description: "capoboutique",
  icons: {
    icon: "/logo/easydzbeauty.svg",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider>
          <RootContent>
            <FacebookPixel />
            {children}
          </RootContent>
        </LanguageProvider>
      </body>
    </html>
  )
}
