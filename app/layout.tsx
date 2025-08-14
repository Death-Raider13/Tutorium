import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Tutorium - Professional Engineering Learning Platform",
    template: "%s | Tutorium",
  },
  description:
    "A modern learning platform where certified lecturers answer your engineering questions, and students can learn via Q&A and video lessons.",
  keywords: [
    "engineering education",
    "online learning",
    "tutoring platform",
    "Q&A platform",
    "video lessons",
    "certified lecturers",
    "study groups",
    "engineering courses",
  ],
  authors: [{ name: "Tutorium Team", url: "https://tutorium.com" }],
  creator: "Tutorium",
  publisher: "Tutorium",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Tutorium - Professional Engineering Learning Platform",
    description:
      "Learn engineering with certified professionals through interactive Q&A, video lessons, and collaborative study groups.",
    siteName: "Tutorium",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tutorium - Engineering Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutorium - Professional Engineering Learning Platform",
    description: "Learn engineering with certified professionals",
    images: ["/og-image.jpg"],
    creator: "@tutorium",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-background font-sans">
              <NavBar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
