import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Shield, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-96 w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            Prepaid Priority Queue System
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Skip the Queue,{" "}
            <span className="text-primary">
              Get Fresh Laundry Faster
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Reserve priority processing slots at partner laundry shops. Book online, pay securely via PayMongo, and receive a QR-coded confirmation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[180px] gap-2">
              <Link href="/shops">
                Book a Slot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[180px]">
              <Link href="/#how-it-works">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">Save Time</span>
              <span className="text-xs text-muted-foreground">No more waiting in long queues</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">Secure Payment</span>
              <span className="text-xs text-muted-foreground">PayMongo-powered checkout</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">Priority Service</span>
              <span className="text-xs text-muted-foreground">Limited daily slots for faster turnaround</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
