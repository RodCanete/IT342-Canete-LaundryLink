"use client"

import { useState } from "react"
import { QrCode, FileText, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type BookingStatus = "Pending Payment" | "Paid" | "Dropped Off" | "Processing" | "Completed"

const bookings: {
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
}[] = [
  {
    id: "1",
    code: "LL-2026-0312",
    shop: "FreshSpin Laundry Hub",
    service: "Priority Wash & Fold",
    serviceType: "PRIORITY",
    date: "March 15, 2026",
    time: "10:00 AM",
    status: "Paid",
    amount: 200,
    fileAttached: true,
  },
  {
    id: "2",
    code: "LL-2026-0298",
    shop: "CleanWave Express",
    service: "Standard Wash & Fold",
    serviceType: "STANDARD",
    date: "March 10, 2026",
    time: "02:00 PM",
    status: "Completed",
    amount: 100,
    fileAttached: false,
  },
  {
    id: "3",
    code: "LL-2026-0305",
    shop: "Sparkle & Fold",
    service: "Priority Wash & Fold",
    serviceType: "PRIORITY",
    date: "March 12, 2026",
    time: "08:00 AM",
    status: "Processing",
    amount: 220,
    fileAttached: true,
  },
  {
    id: "4",
    code: "LL-2026-0320",
    shop: "QuickDry Laundromat",
    service: "Standard Wash & Fold",
    serviceType: "STANDARD",
    date: "March 18, 2026",
    time: "11:00 AM",
    status: "Pending Payment",
    amount: 110,
    fileAttached: false,
  },
  {
    id: "5",
    code: "LL-2026-0287",
    shop: "FreshSpin Laundry Hub",
    service: "Priority Wash & Fold",
    serviceType: "PRIORITY",
    date: "March 8, 2026",
    time: "09:00 AM",
    status: "Dropped Off",
    amount: 200,
    fileAttached: false,
  },
]

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

  const filteredBookings = activeTab === "all"
    ? bookings
    : bookings.filter((b) => b.status.toLowerCase().replace(/\s/g, "-") === activeTab)

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

        {/* Status lifecycle */}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({bookings.filter((b) => b.status === "Paid").length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({bookings.filter((b) => b.status === "Processing").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({bookings.filter((b) => b.status === "Completed").length})
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
      </div>
    </section>
  )
}
