"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Download, QrCode, ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api"
import {
  formatBackendTime,
  formatBookingDate,
  getBooking,
  getShop,
  listShopServices,
  statusToLabel,
  type BookingApi,
  type ServiceApi,
  type ShopApi,
} from "@/lib/booking-api"

type BookingConfirmationProps = {
  bookingId?: string
}

export function BookingConfirmation({ bookingId }: BookingConfirmationProps) {
  const [booking, setBooking] = useState<BookingApi | null>(null)
  const [shop, setShop] = useState<ShopApi | null>(null)
  const [service, setService] = useState<ServiceApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadConfirmationData() {
      if (!bookingId) {
        setErrorMessage("Missing bookingId in URL")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const bookingData = await getBooking(bookingId)
        const [shopData, services] = await Promise.all([
          getShop(bookingData.shopId),
          listShopServices(bookingData.shopId),
        ])

        if (!active) {
          return
        }

        setBooking(bookingData)
        setShop(shopData)
        setService(services.find((item) => item.id === bookingData.serviceId) ?? null)
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load booking confirmation"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadConfirmationData()

    return () => {
      active = false
    }
  }, [bookingId])

  const statusLabel = useMemo(() => {
    if (!booking) {
      return "Pending Payment"
    }

    return statusToLabel(booking.status)
  }, [booking])

  if (isLoading) {
    return (
      <section className="bg-background py-8 lg:py-16">
        <div className="mx-auto max-w-lg px-4 lg:px-8 text-sm text-muted-foreground">Loading booking confirmation...</div>
      </section>
    )
  }

  if (!booking || !shop || errorMessage) {
    return (
      <section className="bg-background py-8 lg:py-16">
        <div className="mx-auto max-w-lg px-4 lg:px-8">
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage || "Booking confirmation data is unavailable."}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-8 lg:py-16">
      <div className="mx-auto max-w-lg px-4 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your booking is now in the system. Show your booking code at the shop.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30">
                <QrCode className="h-20 w-20 text-primary/30" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Booking Code</p>
                <p className="text-xl font-bold tracking-widest text-foreground">{booking.bookingCode}</p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shop</span>
                <span className="font-medium text-foreground">{shop.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <Badge className="bg-primary text-primary-foreground">{service?.name || "Unknown Service"}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{formatBookingDate(booking.bookingDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Slot</span>
                <span className="font-medium text-foreground">{formatBackendTime(booking.timeSlot)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-none font-medium">
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Amount</span>
                <span className="text-primary">PHP {(service?.price || 0).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                Use your booking code to confirm drop-off at the shop counter.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2" disabled>
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              <Button asChild className="w-full gap-2">
                <Link href="/bookings">
                  View My Bookings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
