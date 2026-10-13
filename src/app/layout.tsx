import type { Metadata } from "next"
import { Big_Shoulders, DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { IntroProvider } from "@/context/IntroContext"

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
    <html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable}`}>
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
