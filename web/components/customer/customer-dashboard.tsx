"use client"

import Link from "next/link"
import { useState } from "react"
import { CalendarCheck2, Clock3, CreditCard, MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PartnerShopsMap } from "@/components/customer/partner-shops-map"
import { partnerShops } from "@/lib/partner-shops"

const metrics = [
  { label: "Upcoming Bookings", value: "3", icon: CalendarCheck2, tone: "text-primary" },
  { label: "Pending Payment", value: "1", icon: CreditCard, tone: "text-warning" },
  { label: "Next Drop-Off", value: "Tomorrow", icon: Clock3, tone: "text-accent" },
  { label: "Favorite Shop", value: "FreshSpin", icon: MapPinned, tone: "text-success" },
]

export function CustomerDashboard() {
  const [activeShopId, setActiveShopId] = useState(partnerShops[0]?.id ?? 1)
  const activeShop = partnerShops.find((shop) => shop.id === activeShopId) ?? partnerShops[0]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background via-background to-muted/20">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-3 border-none bg-primary/10 text-primary">
                Customer Dashboard
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Track bookings, payments, and upcoming laundry visits in one place.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Your booking history and account actions are grouped here so you can move from discovery to checkout without leaving your workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/shops">Book a Slot</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/bookings">My Bookings</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shops">Browse Shops</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="border-border shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 ${metric.tone}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <PartnerShopsMap activeShop={activeShop} onSelectShop={setActiveShopId} />
        </section>
      </main>
      <Footer />
    </div>
  )
}