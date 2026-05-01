"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CtaSection() {
  return (
    <section
      className="relative overflow-hidden py-16 lg:py-20"
      style={{
        background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-primary))",
        backgroundSize: "200% 100%",
        animation: "shimmer-slide 5s linear infinite",
      }}
    >
      {/* Decorative bubble overlays */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-white/8 blur-xl" />
        <div className="absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/10 blur-lg" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
        <h2 className="flex items-center justify-center gap-3 text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          <Sparkles className="h-7 w-7 opacity-80" />
          Ready to Skip the Queue?
          <Sparkles className="h-7 w-7 opacity-80" />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/85">
          Create your free account and book your first priority laundry slot today.
          Fast, predictable, hassle-free.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="min-w-[180px] gap-2 shadow-lg"
          >
            <Link to="/register">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-w-[180px] border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/shops">Browse Shops</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
