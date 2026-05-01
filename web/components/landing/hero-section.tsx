"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, QrCode, Shield, WashingMachine, Star } from "lucide-react"
import { Link } from "react-router-dom"

const BOOKING_TICKS = [
  { name: "Maria S.", service: "Priority", shop: "GF22 Laundry Hub", time: "2 min ago" },
  { name: "Juan D.", service: "Standard", shop: "Wash 'n Spin", time: "5 min ago" },
  { name: "Ana R.", service: "Priority", shop: "Isa's Laundry", time: "8 min ago" },
]

function LiveBookingTicker() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BOOKING_TICKS.length), 2800)
    return () => clearInterval(t)
  }, [])

  const b = BOOKING_TICKS[idx]

  return (
    <div
      className="inline-flex items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md"
      style={{ minWidth: 230 }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-success"
        style={{ animation: "live-pulse 1.4s ease-in-out infinite" }}
      />
      <div className="overflow-hidden">
        <p
          key={idx}
          className="text-xs font-semibold text-foreground"
          style={{ animation: "slide-in-right 0.35s ease-out both" }}
        >
          {b.name} booked{" "}
          <span className="text-primary">{b.service}</span> at {b.shop}
        </p>
        <p className="text-[10px] text-muted-foreground">{b.time}</p>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-20 -top-32 h-[500px] w-[500px] rounded-full bg-primary/[0.06] blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 h-[380px] w-[380px] rounded-full bg-accent/[0.07] blur-[70px]" />
        {/* Floating decorative circles */}
        <div
          className="absolute right-[38%] top-20 h-[18px] w-[18px] rounded-full bg-primary/15"
          style={{ animation: "float-y 3.2s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[32%] top-52 h-[10px] w-[10px] rounded-full bg-accent/20"
          style={{ animation: "float-y 4.1s ease-in-out infinite 0.8s" }}
        />
        <div
          className="absolute bottom-32 left-[42%] h-[14px] w-[14px] rounded-full bg-success/20"
          style={{ animation: "float-y-slow 5s ease-in-out infinite 1.2s" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-14 lg:py-16">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.9fr]">

          {/* Left: copy */}
          <div>
            {/* Badge pill */}
            <div
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3.5 py-1.5 text-xs font-semibold text-primary"
              style={{ animation: "fade-in-up 0.4s ease-out both" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-success"
                style={{ animation: "live-pulse 2s ease-in-out infinite" }}
              />
              Now serving Cebu City
              <span className="font-normal text-muted-foreground">· 5 partner shops</span>
            </div>

            {/* Headline */}
            <h1
              className="mb-5 font-extrabold leading-[1.04] tracking-[-0.03em] text-foreground"
              style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                animation: "fade-in-up 0.5s ease-out 0.07s both",
              }}
            >
              Skip the Queue.{" "}
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                Get Laundry Done
              </span>
              <br />
              On Your Time.
            </h1>

            {/* Body */}
            <p
              className="mb-8 max-w-[460px] text-base leading-[1.75] text-muted-foreground"
              style={{ animation: "fade-in-up 0.5s ease-out 0.14s both" }}
            >
              Reserve priority slots at partner laundry shops in Cebu. Pay online via
              PayMongo, get a QR confirmation, and drop off without the wait.
            </p>

            {/* Trust bullets */}
            <ul
              className="mb-9 flex flex-col gap-2.5"
              style={{ animation: "fade-in-up 0.5s ease-out 0.2s both" }}
            >
              {[
                { Icon: CheckCircle2, text: "Instant slot confirmation", cls: "text-success" },
                { Icon: QrCode, text: "QR-coded drop-off — no paperwork", cls: "text-primary" },
                { Icon: Shield, text: "Prepaid via PayMongo — no cash needed", cls: "text-accent" },
              ].map(({ Icon, text, cls }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <Icon className={`h-4 w-4 shrink-0 ${cls}`} />
                  {text}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div
              className="mb-11 flex flex-wrap gap-3"
              style={{ animation: "fade-in-up 0.5s ease-out 0.26s both" }}
            >
              <Button
                asChild
                size="lg"
                className="gap-2 text-[15px] font-bold shadow-[0_4px_18px_oklch(0.536_0.234_264/0.35)]"
                style={{ animation: "pulse-glow 2.8s ease-in-out infinite" }}
              >
                <Link to="/shops">
                  Book a Slot
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-[15px] font-semibold">
                <Link to="/login">Log In</Link>
              </Button>
            </div>

            {/* Live booking ticker */}
            <div style={{ animation: "fade-in-up 0.5s ease-out 0.34s both" }}>
              <LiveBookingTicker />
            </div>
          </div>

          {/* Right: image + floating cards */}
          <div
            className="relative hidden lg:block"
            style={{ animation: "fade-in-up 0.65s ease-out 0.18s both" }}
          >
            {/* Outer wrapper — no overflow clip, positions all floating cards */}
            <div className="relative h-[480px]">
              {/* Inner wrapper — clips image to rounded rect only */}
              <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
                <img
                  src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80"
                  alt="Clean laundry"
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/35" />

                {/* Floating stat card — bottom left, within image bounds */}
                <div
                  className="absolute bottom-[18px] left-[18px] flex items-center gap-3 rounded-[18px] border border-border/60 bg-white p-[13px_16px] shadow-[0_8px_24px_rgba(0,0,0,0.14)] backdrop-blur-md"
                  style={{ animation: "float-y 4s ease-in-out infinite" }}
                >
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <WashingMachine
                      className="h-5 w-5 text-primary"
                      style={{ animation: "spin-slow 8s linear infinite" }}
                    />
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold leading-none text-foreground">500+</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Bookings this month</p>
                  </div>
                </div>

                {/* Floating rating card — top right, within image bounds */}
                <div
                  className="absolute right-[18px] top-[18px] flex items-center gap-1.5 rounded-2xl border border-border/60 bg-white px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-md"
                  style={{ animation: "float-y-slow 5s ease-in-out infinite 1s" }}
                >
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm font-extrabold text-foreground">4.9</span>
                  <span className="text-[11px] text-muted-foreground">avg rating</span>
                </div>
              </div>

              {/* QR confirmation card — outside inner div, peeks past right edge */}
              <div
                className="absolute -right-6 bottom-[100px] rounded-2xl border border-border/60 bg-white p-[12px_14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[10px]"
                style={{ animation: "float-y 3.6s ease-in-out infinite 0.5s" }}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-success/[0.12]">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground">Booking Confirmed!</p>
                    <p className="text-[10px] text-muted-foreground">Priority slot reserved</p>
                  </div>
                </div>
                <div className="rounded-[6px] bg-primary/[0.07] px-2 py-1 text-center font-mono text-xs font-bold tracking-wider text-primary">
                  LL-2026-05-001
                </div>
              </div>
            </div>

            {/* Stats bar below image */}
            <div className="mt-3.5 grid grid-cols-3 gap-3">
              {[
                { value: "500+", label: "Bookings made", color: "text-primary" },
                { value: "5", label: "Partner shops", color: "text-accent" },
                { value: "4.9★", label: "Avg rating", color: "text-warning" },
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className="rounded-[14px] border border-border/60 bg-card py-3.5 text-center shadow-sm"
                >
                  <p className={`text-xl font-extrabold leading-none ${color}`}>{value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: compact stats */}
          <div className="grid grid-cols-3 gap-3 lg:hidden">
            {[
              { value: "500+", label: "Bookings" },
              { value: "5", label: "Shops" },
              { value: "4.9★", label: "Rating" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border border-border/60 bg-card px-3 py-4 shadow-sm"
              >
                <span className="text-xl font-extrabold text-primary">{value}</span>
                <span className="mt-1 text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
