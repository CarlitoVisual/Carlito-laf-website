import type { Metadata } from "next"
import { Big_Shoulders, DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { IntroProvider } from "@/context/IntroContext"
import JsonLd from "@/components/seo/JsonLd"
import { SITE_URL, SITE_NAME, businessJsonLd } from "@/lib/seo"

const display = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
})

const body = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

const mono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Carlito Laf Visuel — Photographe & Vidéaste Aventure",
    template: "%s | Carlito Laf Visuel",
  },
  description:
    "Photographe et vidéaste au Pays basque, spécialisé dans l'aventure, les sports nautiques et les paysages. Portfolio, tirages Fine Art et prestations sur devis.",
  applicationName: SITE_NAME,
  authors: [{ name: "Charles Lafiandra", url: SITE_URL }],
  creator: "Charles Lafiandra",
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex flex-col min-h-screen">
        <JsonLd data={businessJsonLd()} />
        <IntroProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </IntroProvider>
      </body>
    </html>
  )
}
