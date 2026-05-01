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
      className="bg-gradient-to-b from-background via-secondary/30 to-background py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <span className="text-base">💧</span>
            Simple process
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Book your laundry slot in four simple steps. No more unpredictable wait times.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative flex flex-col items-center text-center"
              style={{ animation: "fade-in-up 0.55s ease-out both", animationDelay: `${i * 0.1}s` }}
            >
              {/* Gradient connecting line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+36px)] top-8 hidden h-px w-[calc(100%-72px)] bg-gradient-to-r from-primary/30 to-accent/30 lg:block" />
              )}

              {/* Icon */}
              <div
                className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110"
                style={{
                  animation: "pulse-glow 3.5s ease-in-out infinite",
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {i + 1}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
