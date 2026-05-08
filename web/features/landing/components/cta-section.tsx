"use client"

import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section
      className="relative overflow-hidden py-20 lg:py-24"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
        backgroundSize: "200% 200%",
        animation: "gradient-shift 6s ease infinite",
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/[0.07]" />
        <div className="absolute bottom-0 right-1/4 h-52 w-52 rounded-full bg-white/[0.06]" />
        <div className="absolute right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/[0.05]" />
      </div>

      <div className="relative mx-auto max-w-[620px] px-6 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white">
          No queues. No cash. No stress.
        </div>
        <h2 className="mb-4 text-[38px] font-black leading-[1.1] tracking-[-0.025em] text-white">
          Ready to Skip the Queue?
        </h2>
        <p className="mb-9 text-base leading-[1.7] text-white/80">
          Create your free account and book your first priority laundry slot today.
          Fast, predictable, hassle-free.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-w-[180px] gap-2 bg-white font-extrabold text-primary shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-white/90 hover:text-primary"
          >
            <Link to="/register">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="min-w-[180px] border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            variant="outline"
          >
            <Link to="/shops">Browse Shops</Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-white/55">
          Free to join · No subscription · Pay only when you book
        </p>
      </div>
    </section>
  )
}
