import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SolanaProvider } from "@/components/providers/solana-provider"
import { Header } from "@/components/header"
import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'


export const metadata: Metadata = {
  title: "🐊Croc Dent 🐊",
  description:
    "A fun and suspenseful tooth-pressing game! Press the teeth carefully - one will make the crocodile bite!",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SolanaProvider>
          <Header />
          <main>
            {children}
          </main>
          <Analytics />
        </SolanaProvider>
      </body>
    </html>
  )
}
