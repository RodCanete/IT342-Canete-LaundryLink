"use client"

import { Search, CalendarCheck, CreditCard, QrCode } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Browse Shops",
    description:
      "Explore partner laundry shops on the map. View ratings, operating hours, and available services.",
  },
  {
    icon: CalendarCheck,
    title: "Select a Slot",
    description:
      "Pick your preferred date and time. Choose between Standard or Priority service tiers.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description:
      "Complete prepaid payment via PayMongo. Your slot is reserved once payment is confirmed.",
  },
  {
    icon: QrCode,
    title: "Show QR Code",
    description:
      "Receive a QR-coded confirmation. Present it at the shop to skip the queue and drop off your laundry.",
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-card py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1100px] px-6">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.08] px-3.5 py-1.5 text-xs font-semibold text-primary">
            Simple process
          </div>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-pretty text-muted-foreground">
            Four steps to fresh laundry without the wait.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative z-10 flex flex-col items-center text-center"
              style={{ animation: `fade-in-up 0.55s ease-out ${i * 0.1}s both` }}
            >
              {/* Connector: starts at right edge of this icon, ends at left edge of next icon */}
              {i < steps.length - 1 && (
                <div
                  className="absolute top-8 hidden h-px bg-gradient-to-r from-primary/25 to-accent/25 lg:block"
                  style={{ left: "calc(50% + 32px)", right: "-50%" }}
                />
              )}

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                  i === 0
                    ? "bg-primary shadow-[0_8px_20px_oklch(0.536_0.234_264/0.35)]"
                    : "bg-primary/10"
                }`}
                style={{
                  animation: "pulse-glow 3.5s ease-in-out infinite",
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <step.icon
                  className={`h-7 w-7 ${i === 0 ? "text-primary-foreground" : "text-primary"}`}
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {i + 1}
                </span>
              </div>

              <h3 className="mb-2 text-[15px] font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
