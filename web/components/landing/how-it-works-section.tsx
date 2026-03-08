import { Search, CalendarCheck, CreditCard, QrCode } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Browse Shops",
    description: "Explore partner laundry shops on the map. View ratings, operating hours, and available services.",
  },
  {
    icon: CalendarCheck,
    title: "Select a Slot",
    description: "Pick your preferred date and time. Choose between Standard or Priority service tiers.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description: "Complete prepaid payment via PayMongo. Your slot is reserved once payment is confirmed.",
  },
  {
    icon: QrCode,
    title: "Show QR Code",
    description: "Receive a QR-coded confirmation. Present it at the shop to skip the queue and drop off your laundry.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Book your laundry slot in four simple steps. No more unpredictable wait times.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+32px)] top-8 hidden h-px w-[calc(100%-64px)] bg-border lg:block" />
              )}
              <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
