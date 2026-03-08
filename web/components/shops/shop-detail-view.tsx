"use client"

import Link from "next/link"
import { MapPin, Clock, Star, ArrowLeft, Zap, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const shop = {
  id: 1,
  name: "FreshSpin Laundry Hub",
  address: "123 Osmeña Blvd, Cebu City",
  city: "Cebu City",
  hours: "7:00 AM - 9:00 PM",
  rating: 4.8,
  reviewCount: 142,
  description: "A modern self-service and full-service laundromat equipped with commercial-grade machines. We offer same-day turnaround for priority bookings.",
  services: [
    {
      id: 1,
      name: "Standard Wash & Fold",
      type: "STANDARD" as const,
      price: 120,
      description: "Regular queue processing. Typically 4-6 hours turnaround during business hours.",
      features: ["8kg load capacity", "Detergent included", "Fold & pack"],
    },
    {
      id: 2,
      name: "Priority Wash & Fold",
      type: "PRIORITY" as const,
      price: 200,
      description: "Limited daily slots for faster turnaround. Processed within 2-3 hours of drop-off.",
      features: ["8kg load capacity", "Detergent included", "Fold & pack", "2-3 hour turnaround", "SMS notification"],
      slotsRemaining: 3,
      maxSlots: 10,
    },
  ],
}

export function ShopDetailView() {
  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <Link
          href="/shops"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shops
        </Link>

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {shop.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {shop.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {shop.hours}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-semibold text-foreground">{shop.rating}</span>
              <span className="text-xs text-muted-foreground">({shop.reviewCount} reviews)</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {shop.description}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background">
            <div className="flex flex-col items-center gap-2 text-center">
              <MapPin className="h-8 w-8 text-primary/40" />
              <p className="text-sm text-muted-foreground">Shop location on Google Map</p>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        <div>
          <h2 className="mb-6 text-xl font-bold text-foreground">Available Services</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {shop.services.map((service) => (
              <Card
                key={service.id}
                className={`relative overflow-hidden border-border transition-all hover:shadow-md ${
                  service.type === "PRIORITY" ? "ring-2 ring-primary/20" : ""
                }`}
              >
                {service.type === "PRIORITY" && (
                  <div className="absolute right-0 top-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                      <Zap className="mr-1 h-3 w-3" />
                      Priority
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{'PHP '}{service.price}</span>
                    <span className="text-sm text-muted-foreground">/ load</span>
                  </div>

                  <ul className="flex flex-col gap-1.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {service.type === "PRIORITY" && service.slotsRemaining !== undefined && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {service.slotsRemaining} of {service.maxSlots} slots remaining today
                      </span>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link
                      href={`/shops/${shop.id}/book?service=${service.id}&type=${service.type}`}
                    >
                      {service.type === "PRIORITY" ? "Book Priority Slot" : "Book Standard"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
