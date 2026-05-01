"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Timer, Shield, Star, WashingMachine, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import Silk from "./Silk"

const stats = [
  { value: "500+", label: "Bookings Made" },
  { value: "5", label: "Partner Shops" },
  { value: "QR Code", label: "Easy Pickup" },
]

const features = [
  { icon: Timer, title: "Save Time", desc: "No more waiting in long queues", delay: "0s" },
  { icon: Shield, title: "Secure Payment", desc: "PayMongo-powered checkout", delay: "0.12s" },
  { icon: Star, title: "Priority Service", desc: "Limited daily slots for faster turnaround", delay: "0.24s" },
]

const trustPoints = [
  "Instant booking confirmation",
  "QR code drop-off",
  "Prepaid — no cash needed",
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">

      {/* ── Silk WebGL background ── */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ opacity: 0.35 }} aria-hidden="true">
        <Silk speed={5} scale={1} color="#5B6FEF" noiseIntensity={1.5} rotation={0} />
      </div>

      {/* ── Bottom gradient fade ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-background/60"
        aria-hidden="true"
      />

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:flex lg:min-h-screen lg:items-center lg:px-12 lg:py-0">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">

          {/* ── Left column: text ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

            {/* Badge pill */}
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              style={{ animation: "fade-in-up 0.5s ease-out both" }}
            >
              <WashingMachine className="h-3.5 w-3.5" />
              Prepaid Priority Queue System
            </div>

            {/* Headline */}
            <h1
              className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[4.5rem] lg:leading-[1.05]"
              style={{ animation: "fade-in-up 0.55s ease-out both", animationDelay: "0.08s" }}
            >
              Skip the Queue,{" "}
              <span className="relative inline-block text-primary">
                Get Fresh Laundry
                <br className="hidden lg:block" />
                <span className="lg:hidden"> </span>
                Faster
                <span
                  className="absolute -bottom-1 left-0 h-[4px] w-full rounded-full bg-gradient-to-r from-primary via-accent to-primary opacity-70"
                  aria-hidden="true"
                />
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
              style={{ animation: "fade-in-up 0.6s ease-out both", animationDelay: "0.16s" }}
            >
              Reserve priority processing slots at partner laundry shops. Book online,
              pay securely via PayMongo, and receive a QR-coded confirmation.
            </p>

            {/* Trust points */}
            <ul
              className="mt-7 flex flex-col items-center gap-3 lg:items-start"
              style={{ animation: "fade-in-up 0.6s ease-out both", animationDelay: "0.22s" }}
            >
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  {point}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start"
              style={{ animation: "fade-in-up 0.6s ease-out both", animationDelay: "0.28s" }}
            >
              <Button
                asChild
                size="lg"
                className="min-w-[180px] gap-2 text-base font-semibold shadow-lg"
                style={{ animation: "pulse-glow 2.8s ease-in-out infinite" }}
              >
                <Link to="/shops">
                  Book a Slot
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] text-base font-semibold"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </Button>
            </div>

            {/* Stat bar */}
            <div
              className="mt-12 flex w-full max-w-md items-center justify-center divide-x divide-border rounded-2xl border border-border/60 bg-card/80 px-4 py-5 shadow-sm backdrop-blur-sm lg:justify-start"
              style={{ animation: "fade-in-up 0.65s ease-out both", animationDelay: "0.35s" }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center px-6 sm:px-10">
                  <span className="text-2xl font-extrabold text-primary">{stat.value}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: hero photo ── */}
          <div
            className="relative hidden lg:flex lg:flex-col lg:gap-5"
            style={{ animation: "fade-in-up 0.7s ease-out both", animationDelay: "0.2s" }}
          >
            {/* Main image — floating cards sit inside the image bounds */}
            <div className="relative h-[560px] overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80"
                alt="Clean folded laundry"
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />

              {/* Floating booking count card — anchored inside the image */}
              <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <WashingMachine className="h-5 w-5 text-primary" style={{ animation: "spin-slow 8s linear infinite" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">500+ Bookings</p>
                  <p className="text-xs text-muted-foreground">This month alone</p>
                </div>
              </div>

              {/* Floating rating card — anchored inside the image */}
              <div className="absolute top-5 right-5 z-10 flex items-center gap-2 rounded-2xl border border-border/60 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-md">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-bold text-foreground">4.9</span>
                <span className="text-xs text-muted-foreground">Customer rating</span>
              </div>
            </div>

            {/* Feature cards row */}
            <div className="grid grid-cols-3 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                  style={{ animation: "fade-in-up 0.65s ease-out both", animationDelay: f.delay }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-center text-xs font-semibold text-foreground">{f.title}</span>
                  <span className="text-center text-[11px] leading-relaxed text-muted-foreground">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Feature cards for mobile ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:hidden">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                style={{ animation: "fade-in-up 0.65s ease-out both", animationDelay: f.delay }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{f.title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{f.desc}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
