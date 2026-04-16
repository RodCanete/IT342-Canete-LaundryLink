import { MapPin, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { partnerShops } from "@/lib/partner-shops"

export function ShopListSection() {
  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Partner Laundry Shops
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Browse our curated list of trusted laundry shops. Select one to view services and book your priority slot.
          </p>
        </div>

        <div className="mb-10 rounded-xl border border-border bg-muted/40 p-4 lg:p-6">
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-background sm:h-80">
            <div className="flex flex-col items-center gap-3 text-center">
              <MapPin className="h-10 w-10 text-primary/40" />
              <div>
                <p className="text-sm font-medium text-foreground">Interactive Google Map</p>
                <p className="text-xs text-muted-foreground">
                  Shop markers will appear here with live location data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {partnerShops.map((shop) => {
            const standardService = shop.services.find((service) => service.type === "STANDARD") ?? shop.services[0]
            const priorityService = shop.services.find((service) => service.type === "PRIORITY") ?? shop.services[0]

            return (
            <Card key={shop.id} className="group overflow-hidden border-border transition-shadow hover:shadow-lg">
              <div className="relative h-40 bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
                {(priorityService.slotsRemaining ?? 0) <= 2 && (
                  <Badge className="absolute right-3 top-3 bg-destructive text-destructive-foreground">
                    {(priorityService.slotsRemaining ?? 0) === 1
                      ? "1 Priority Slot Left"
                      : `${priorityService.slotsRemaining ?? 0} Slots Left`}
                  </Badge>
                )}
              </div>
              <CardContent className="flex flex-col gap-3 p-5">
                <div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {shop.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
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

                <div className="flex items-center gap-2 rounded-lg bg-secondary/60 p-2.5 text-xs">
                  <div className="flex-1 text-center">
                    <span className="block text-muted-foreground">Standard</span>
                    <span className="font-semibold text-foreground">{'PHP '}{standardService.price}</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex-1 text-center">
                    <span className="block text-primary font-medium">Priority</span>
                    <span className="font-semibold text-foreground">{'PHP '}{priorityService.price}</span>
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
