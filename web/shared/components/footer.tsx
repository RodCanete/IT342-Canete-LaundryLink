"use client"

import { Link } from "react-router-dom"
import { WashingMachine } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Find Shops", href: "/shops" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],
  account: [
    { label: "Log In", href: "/login" },
    { label: "Create Account", href: "/register" },
    { label: "My Bookings", href: "/bookings" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-card to-secondary/50">
      {/* Wave SVG divider at top */}
      <div className="absolute -top-px left-0 w-full overflow-hidden leading-none" aria-hidden="true">
        <svg
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          className="h-6 w-full"
          style={{ fill: "var(--color-card)" }}
        >
          <path d="M0,12 C200,24 400,0 600,12 C800,24 1000,0 1200,12 L1200,0 L0,0 Z" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <WashingMachine className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">LaundryLink</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Prepaid priority laundry slot reservations. Book online, pay securely,
              skip the queue.
            </p>
            {/* Tagline bubble */}
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span
                className="h-1.5 w-1.5 rounded-full bg-success"
                style={{ animation: "live-pulse 2s ease-in-out infinite" }}
              />
              Cebu City, Philippines
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Product</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Support</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 LaundryLink. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for IT342 — System Integration and Architecture
          </p>
        </div>
      </div>
    </footer>
  )
}
