import Link from "next/link"
import { MapPin, Clock, Star, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const shops = [
  {
    id: 1,
    name: "FreshSpin Laundry Hub",
    address: "123 Osmeña Blvd, Cebu City",
    city: "Cebu City",
    hours: "7:00 AM - 9:00 PM",
    rating: 4.8,
    standardPrice: 120,
    priorityPrice: 200,
    prioritySlotsLeft: 3,
  },
  {
    id: 2,
    name: "CleanWave Express",
    address: "45 Mango Ave, Cebu City",
    city: "Cebu City",
    hours: "6:00 AM - 10:00 PM",
    rating: 4.6,
    standardPrice: 100,
    priorityPrice: 180,
    prioritySlotsLeft: 5,
  },
  {
    id: 3,
    name: "Sparkle & Fold",
    address: "78 Colon St, Cebu City",
    city: "Cebu City",
    hours: "8:00 AM - 8:00 PM",
    rating: 4.9,
    standardPrice: 130,
    priorityPrice: 220,
    prioritySlotsLeft: 1,
  },
  {
    id: 4,
    name: "QuickDry Laundromat",
    address: "200 Gorordo Ave, Cebu City",
    city: "Cebu City",
    hours: "6:00 AM - 11:00 PM",
    rating: 4.5,
    standardPrice: 110,
    priorityPrice: 190,
    prioritySlotsLeft: 4,
  },
  {
    id: 5,
    name: "BrightWash Laundry",
    address: "15 Gen. Maxilom Ave, Cebu City",
    city: "Cebu City",
    hours: "7:00 AM - 10:00 PM",
    rating: 4.7,
    standardPrice: 115,
    priorityPrice: 195,
    prioritySlotsLeft: 2,
  },
]

export function ShopListPage() {
  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Find a Laundry Shop</h1>
          <p className="mt-2 text-muted-foreground">
            Browse partner shops near you and book a slot.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shops by name or location..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="mb-10 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border bg-background sm:h-96">
            <div className="flex flex-col items-center gap-3 text-center">
              <MapPin className="h-12 w-12 text-primary/40" />
              <div>
                <p className="font-medium text-foreground">Interactive Google Map</p>
                <p className="text-sm text-muted-foreground">
                  Partner shop markers with live location data from Google Maps API
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <Card key={shop.id} className="group border-border transition-all hover:shadow-lg hover:border-primary/20">
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {shop.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {shop.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {shop.rating}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {shop.hours}
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
                  <div className="flex-1 text-center">
                    <span className="block text-xs text-muted-foreground">Standard</span>
                    <span className="text-sm font-semibold text-foreground">{'PHP '}{shop.standardPrice}</span>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex-1 text-center">
                    <span className="block text-xs font-medium text-primary">Priority</span>
                    <span className="text-sm font-semibold text-foreground">{'PHP '}{shop.priorityPrice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {shop.prioritySlotsLeft <= 3 ? (
                    <Badge variant="secondary" className="text-xs bg-destructive/10 text-destructive border-none">
                      {shop.prioritySlotsLeft} priority {shop.prioritySlotsLeft === 1 ? "slot" : "slots"} left today
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-success/10 text-success border-none">
                      {shop.prioritySlotsLeft} priority slots available
                    </Badge>
                  )}
                </div>

                <Button asChild size="sm" className="w-full">
                  <Link href={`/shops/${shop.id}`}>View Shop & Book</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
