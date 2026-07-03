"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useIntro } from "@/context/IntroContext"

const links = [
  { href: "/", label: "Accueil" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/prestations", label: "Prestations" },
  { href: "/boutique", label: "Boutique" },
  { href: "/contact", label: "Contact" },
]

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isExpanded } = useIntro()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  // While intro video is fullscreen, hide the nav entirely
  if (isExpanded) return null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(10,10,10,0.95)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-base font-bold uppercase"
          style={{ color: "var(--color-text)", letterSpacing: "0.2em" }}
        >
          Carlito Laf
          <span style={{ color: "var(--color-accent)" }}> Visuel</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs uppercase transition-colors duration-200"
              style={{
                color:
                  pathname === l.href
                    ? "var(--color-accent)"
                    : "var(--color-muted)",
                letterSpacing: "0.18em",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/devis"
            className="text-xs uppercase px-5 py-2 border transition-all duration-200 hover:bg-[var(--color-accent)] hover:text-black hover:border-[var(--color-accent)]"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent)",
              letterSpacing: "0.18em",
            }}
          >
            Devis gratuit
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span
            className="block w-6 h-0.5 transition-transform duration-300 origin-center"
            style={{
              background: "var(--color-text)",
              transform: open ? "rotate(45deg) translate(3px,3px)" : "",
            }}
          />
          <span
            className="block w-6 h-0.5 transition-opacity duration-300"
            style={{ background: "var(--color-text)", opacity: open ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 transition-transform duration-300 origin-center"
            style={{
              background: "var(--color-text)",
              transform: open ? "rotate(-45deg) translate(3px,-3px)" : "",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-6 pb-8 flex flex-col gap-4"
          style={{ background: "rgba(10,10,10,0.98)" }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs uppercase py-3 border-b"
              style={{
                color:
                  pathname === l.href
                    ? "var(--color-accent)"
                    : "var(--color-text)",
                borderColor: "var(--color-border)",
                letterSpacing: "0.18em",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/devis"
            className="text-xs uppercase px-5 py-3 border mt-2 text-center"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent)",
              letterSpacing: "0.18em",
            }}
          >
            Devis gratuit
          </Link>
        </div>
      )}
    </header>
  )
}
