import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lato } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato" 
})

export const metadata: Metadata = {
  title: "Dashboard Pro - Modern Analytics Platform",
  description:
    "A production-grade dashboard built with Next.js, featuring real-time analytics, user management, and beautiful animations.",
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

export const viewport: Viewport = {
  themeColor: "#00444a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
