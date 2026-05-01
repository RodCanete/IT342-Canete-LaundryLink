"use client"

import { MapPin, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { partnerShops } from "@/lib/partner-shops"
import { ShopMap } from "@/components/maps/shop-map"

const shopPhotos = [
  "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517677208171-0bc6132cfc8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1604335398980-ededccc3a25a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
]

export function ShopListSection() {
  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-success">
            {/* Live indicator */}
            <span
              className="inline-block h-2 w-2 rounded-full bg-success"
              style={{ animation: "live-pulse 1.4s ease-in-out infinite" }}
            />
            Live Availability
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Partner Laundry Shops
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Browse our curated list of trusted laundry shops. Select one to view services
            and book your priority slot.
          </p>
        </div>

        {/* Google Map */}
        <div className="mb-10 overflow-hidden rounded-xl border border-border bg-muted/40 p-4 lg:p-6">
          <div className="h-64 overflow-hidden rounded-lg sm:h-80">
            <ShopMap />
          </div>
        </div>

        {/* Shop cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {partnerShops.map((shop, i) => {
            const standardService =
              shop.services.find((s) => s.type === "STANDARD") ?? shop.services[0]
            const priorityService =
              shop.services.find((s) => s.type === "PRIORITY") ?? shop.services[0]
            const lowSlots = (priorityService.slotsRemaining ?? 0) <= 2

            return (
              <Card
                key={shop.id}
                className="group overflow-hidden border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                style={{ animation: "fade-in-up 0.5s ease-out both", animationDelay: `${i * 0.07}s` }}
              >
                {/* Card image area — real laundry photo */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={shopPhotos[i % shopPhotos.length]}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Urgency badge with pulsing dot */}
                  {lowSlots && (
                    <Badge className="absolute right-3 top-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-destructive-foreground"
                        style={{ animation: "live-pulse 1s ease-in-out infinite" }}
                      />
                      {(priorityService.slotsRemaining ?? 0) === 1
                        ? "1 Slot Left"
                        : `${priorityService.slotsRemaining ?? 0} Slots Left`}
                    </Badge>
                  )}
                </div>

                <CardContent className="flex flex-col gap-3 p-5">
                  <div>
                    <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {shop.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {shop.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {shop.hours}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {shop.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-secondary/60 p-2.5 text-xs">
                    <div className="flex-1 text-center">
                      <span className="block text-muted-foreground">Standard</span>
                      <span className="font-semibold text-foreground">PHP {standardService.price}</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex-1 text-center">
                      <span className="block font-medium text-primary">Priority</span>
                      <span className="font-semibold text-foreground">PHP {priorityService.price}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" className="w-full">
                    <Link to={`/shops/${shop.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
