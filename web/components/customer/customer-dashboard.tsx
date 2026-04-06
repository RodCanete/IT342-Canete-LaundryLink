"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarCheck2, Clock3, CreditCard, MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PartnerShopsMap, type DashboardShop } from "@/components/customer/partner-shops-map"
import { ApiError } from "@/lib/api"
import {
  formatBookingDate,
  isUuid,
  listMyBookings,
  listShopsSummary,
  toIsoDateOnly,
} from "@/lib/booking-api"

export function CustomerDashboard() {
  const [shops, setShops] = useState<DashboardShop[]>([])
  const [activeShopId, setActiveShopId] = useState<string | null>(null)
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0)
  const [nextDropoff, setNextDropoff] = useState("No upcoming bookings")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadDashboardData() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const today = toIsoDateOnly(new Date())
        const [shopRows, bookings] = await Promise.all([listShopsSummary(today), listMyBookings()])
        const validShops = shopRows.filter((shop) => isUuid(shop.id))

        const mappedShops = await Promise.all(
          validShops.map(async (shop) => {
            return {
              id: shop.id,
              name: shop.name,
              address: shop.address,
              hours: shop.operatingHours || "Hours not set",
              rating: 4.8,
              location:
                typeof shop.latitude === "number" && typeof shop.longitude === "number"
                  ? {
                      lat: shop.latitude,
                      lng: shop.longitude,
                    }
                  : null,
              standardPrice: shop.standardPrice ?? 0,
              priorityPrice: shop.priorityPrice ?? 0,
              prioritySlots: shop.prioritySlots ?? 0,
            }
          })
        )

        const now = new Date()
        const upcomingBookings = bookings
          .filter((booking) => new Date(`${booking.bookingDate}T${booking.timeSlot}`) >= now)
          .sort((a, b) =>
            new Date(`${a.bookingDate}T${a.timeSlot}`).getTime() -
            new Date(`${b.bookingDate}T${b.timeSlot}`).getTime()
          )

        if (!active) {
          return
        }

        setShops(mappedShops)
        setActiveShopId(mappedShops[0]?.id ?? null)
        setUpcomingCount(upcomingBookings.length)
        setPendingPaymentCount(bookings.filter((booking) => booking.status === "PENDING_PAYMENT").length)
        setNextDropoff(
          upcomingBookings[0]
            ? formatBookingDate(upcomingBookings[0].bookingDate)
            : "No upcoming bookings"
        )
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      active = false
    }
  }, [])

  const favoriteShopName = useMemo(() => {
    return shops[0]?.name || "No shops available"
  }, [shops])

  const metrics = [
    { label: "Upcoming Bookings", value: String(upcomingCount), icon: CalendarCheck2, tone: "text-primary" },
    { label: "Pending Payment", value: String(pendingPaymentCount), icon: CreditCard, tone: "text-warning" },
    { label: "Next Drop-Off", value: nextDropoff, icon: Clock3, tone: "text-accent" },
    { label: "Favorite Shop", value: favoriteShopName, icon: MapPinned, tone: "text-success" },
  ]

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

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          ) : errorMessage ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : (
            <>
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

              <PartnerShopsMap
                shops={shops}
                activeShopId={activeShopId}
                onSelectShop={setActiveShopId}
              />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
