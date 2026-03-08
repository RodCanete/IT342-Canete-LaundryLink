import { MapPin, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const shops = [
  {
    id: 1,
    name: "FreshSpin Laundry Hub",
    address: "123 Osmeña Blvd, Cebu City",
    hours: "7:00 AM - 9:00 PM",
    rating: 4.8,
    standardPrice: 120,
    priorityPrice: 200,
    prioritySlotsLeft: 3,
    image: "/images/shop-1.jpg",
  },
  {
    id: 2,
    name: "CleanWave Express",
    address: "45 Mango Ave, Cebu City",
    hours: "6:00 AM - 10:00 PM",
    rating: 4.6,
    standardPrice: 100,
    priorityPrice: 180,
    prioritySlotsLeft: 5,
    image: "/images/shop-2.jpg",
  },
  {
    id: 3,
    name: "Sparkle & Fold",
    address: "78 Colon St, Cebu City",
    hours: "8:00 AM - 8:00 PM",
    rating: 4.9,
    standardPrice: 130,
    priorityPrice: 220,
    prioritySlotsLeft: 1,
    image: "/images/shop-3.jpg",
  },
  {
    id: 4,
    name: "QuickDry Laundromat",
    address: "200 Gorordo Ave, Cebu City",
    hours: "6:00 AM - 11:00 PM",
    rating: 4.5,
    standardPrice: 110,
    priorityPrice: 190,
    prioritySlotsLeft: 4,
    image: "/images/shop-4.jpg",
  },
]

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shops.map((shop) => (
            <Card key={shop.id} className="group overflow-hidden border-border transition-shadow hover:shadow-lg">
              <div className="relative h-40 bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
                {shop.prioritySlotsLeft <= 2 && (
                  <Badge className="absolute right-3 top-3 bg-destructive text-destructive-foreground">
                    {shop.prioritySlotsLeft === 1
                      ? "1 Priority Slot Left"
                      : `${shop.prioritySlotsLeft} Slots Left`}
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
                    <span className="font-semibold text-foreground">{'PHP '}{shop.standardPrice}</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex-1 text-center">
                    <span className="block text-primary font-medium">Priority</span>
                    <span className="font-semibold text-foreground">{'PHP '}{shop.priorityPrice}</span>
                  </div>
                </div>

                <Button asChild size="sm" className="w-full">
                  <Link href={`/shops/${shop.id}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
