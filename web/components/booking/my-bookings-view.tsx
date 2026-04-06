"use client"

import { useEffect, useMemo, useState } from "react"
import { QrCode, FileText, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api"
import {
  formatBackendTime,
  formatBookingDate,
  isUuid,
  listMyBookings,
  listShops,
  listShopServices,
} from "@/lib/booking-api"

type BookingStatus = "Pending Payment" | "Paid" | "Dropped Off" | "Processing" | "Completed"

type BookingView = {
  id: string
  code: string
  shop: string
  service: string
  serviceType: "STANDARD" | "PRIORITY"
  date: string
  time: string
  status: BookingStatus
  amount: number
  fileAttached: boolean
}

const statusConfig: Record<BookingStatus, { color: string; bg: string }> = {
  "Pending Payment": { color: "text-warning", bg: "bg-warning/10" },
  Paid: { color: "text-success", bg: "bg-success/10" },
  "Dropped Off": { color: "text-primary", bg: "bg-primary/10" },
  Processing: { color: "text-accent", bg: "bg-accent/10" },
  Completed: { color: "text-muted-foreground", bg: "bg-muted" },
}

const statusOrder: BookingStatus[] = ["Pending Payment", "Paid", "Dropped Off", "Processing", "Completed"]

export function MyBookingsView() {
  const [activeTab, setActiveTab] = useState("all")
  const [bookings, setBookings] = useState<BookingView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBookings() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [bookingRows, shops] = await Promise.all([listMyBookings(), listShops()])
        const shopNameMap = new Map<string, string>(shops.map((shop) => [shop.id, shop.name]))

        const uniqueShopIds = Array.from(
          new Set(bookingRows.map((booking) => booking.shopId).filter((shopId) => isUuid(shopId)))
        )
        const serviceMap = new Map<string, { name: string; serviceType: "STANDARD" | "PRIORITY"; price: number }>()

        await Promise.all(
          uniqueShopIds.map(async (shopId) => {
            const services = await listShopServices(shopId)
            services.forEach((service) => {
              serviceMap.set(service.id, {
                name: service.name,
                serviceType: service.serviceType,
                price: service.price,
              })
            })
          })
        )

        const mappedBookings: BookingView[] = bookingRows
          .map((booking) => {
            const serviceInfo = serviceMap.get(booking.serviceId)

            return {
              id: booking.id,
              code: booking.bookingCode,
              shop: shopNameMap.get(booking.shopId) || "Unknown Shop",
              service: serviceInfo?.name || "Unknown Service",
              serviceType: serviceInfo?.serviceType || "STANDARD",
              date: formatBookingDate(booking.bookingDate),
              time: formatBackendTime(booking.timeSlot),
              status: mapStatus(booking.status),
              amount: serviceInfo?.price || 0,
              fileAttached: !!booking.fileUrl,
            }
          })

        if (!active) {
          return
        }

        setBookings(mappedBookings)
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load bookings"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      active = false
    }
  }, [])

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") {
      return bookings
    }

    return bookings.filter((booking) => booking.status.toLowerCase().replace(/\s/g, "-") === activeTab)
  }, [activeTab, bookings])

  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and manage all your laundry bookings
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 sm:self-start">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-2 text-xs min-w-max">
            {statusOrder.map((status, i) => (
              <div key={status} className="flex items-center gap-1">
                <span className={`rounded-md px-2.5 py-1 font-medium ${statusConfig[status].bg} ${statusConfig[status].color}`}>
                  {status}
                </span>
                {i < statusOrder.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading bookings...</p>
        ) : errorMessage ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({bookings.filter((booking) => booking.status === "Paid").length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({bookings.filter((booking) => booking.status === "Processing").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({bookings.filter((booking) => booking.status === "Completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="flex flex-col gap-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="border-border transition-all hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-foreground">{booking.shop}</h3>
                            <Badge
                              variant="secondary"
                              className={`border-none ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{booking.service}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span>{booking.date}</span>
                            <span>{booking.time}</span>
                            <span className="font-medium text-foreground">PHP {booking.amount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.fileAttached && (
                            <Button variant="ghost" size="icon" className="h-9 w-9" title="View attached file">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View attached file</span>
                            </Button>
                          )}
                          {booking.status !== "Pending Payment" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <QrCode className="h-4 w-4" />
                                  QR Code
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xs">
                                <DialogHeader>
                                  <DialogTitle className="text-center">Booking QR Code</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-4 py-4">
                                  <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30">
                                    <QrCode className="h-24 w-24 text-primary/30" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-lg font-bold tracking-widest text-foreground">
                                      {booking.code}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Present this at the shop
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  )
}

function mapStatus(status: "PENDING_PAYMENT" | "PAID" | "DROPPED_OFF" | "PROCESSING" | "COMPLETED"): BookingStatus {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Pending Payment"
    case "PAID":
      return "Paid"
    case "DROPPED_OFF":
      return "Dropped Off"
    case "PROCESSING":
      return "Processing"
    case "COMPLETED":
      return "Completed"
    default:
      return "Pending Payment"
  }
}
