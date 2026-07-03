import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { IntroProvider } from "@/context/IntroContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Carlito Laf Visuel — Photographe & Vidéaste Aventure",
    template: "%s | Carlito Laf Visuel",
  },
  description:
    "Photographe et vidéaste spécialisé dans l'aventure et les sports nautiques. Portfolio, fine art prints et prestations professionnelles.",
  openGraph: {
    siteName: "Carlito Laf Visuel",
    locale: "fr_FR",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body className="flex flex-col min-h-screen">
        <IntroProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </IntroProvider>
      </body>
    </html>
  )
}
