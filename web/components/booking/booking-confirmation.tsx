
import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Download, QrCode, ArrowRight, Mail, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api"
import {
  createPaymentIntent,
  formatBackendTime,
  formatBookingDate,
  getBooking,
  getPaymentByBooking,
  getShop,
  listShopServices,
  statusToLabel,
  type BookingApi,
  type PaymentApi,
  type ServiceApi,
  type ShopApi,
} from "@/lib/booking-api"

type BookingConfirmationProps = {
  bookingId?: string
  paymentReturnStatus?: string
  paymentInitFailed?: boolean
}

export function BookingConfirmation({
  bookingId,
  paymentReturnStatus,
  paymentInitFailed = false,
}: BookingConfirmationProps) {
  const [booking, setBooking] = useState<BookingApi | null>(null)
  const [shop, setShop] = useState<ShopApi | null>(null)
  const [service, setService] = useState<ServiceApi | null>(null)
  const [payment, setPayment] = useState<PaymentApi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null)

  function toFriendlyPaymentError(error: unknown): string {
    if (!(error instanceof ApiError)) {
      return error instanceof Error ? error.message : "Failed to initialize payment"
    }

    if (error.status === 401) {
      return "Your session expired. Please log in again before paying."
    }

    if (error.status === 403) {
      return "You are not allowed to pay for this booking."
    }

    if (error.status === 409 || error.code === "PAYMENT-001") {
      return "This booking is no longer pending payment. Refresh to see the latest status."
    }

    if (error.code === "PAYMENT-002") {
      return "Payment provider is not configured yet. Please contact support."
    }

    return error.message
  }

  async function loadConfirmationData(activeRef?: { current: boolean }) {
    if (!bookingId) {
      setErrorMessage("Missing bookingId in URL")
      setIsLoading(false)
      return
    }

    setErrorMessage(null)

    try {
      const bookingData = await getBooking(bookingId)
      const [shopData, services] = await Promise.all([
        getShop(bookingData.shopId),
        listShopServices(bookingData.shopId),
      ])

      if (activeRef && !activeRef.current) {
        return
      }

      setBooking(bookingData)
      setShop(shopData)
      setService(services.find((item) => item.id === bookingData.serviceId) ?? null)

      if (bookingData.status === "PENDING_PAYMENT") {
        try {
          const paymentData = await getPaymentByBooking(bookingData.id)
          if (activeRef && !activeRef.current) {
            return
          }
          setPayment(paymentData)
          setActionErrorMessage(null)
        } catch (paymentError) {
          if (activeRef && !activeRef.current) {
            return
          }

          if (paymentError instanceof ApiError && paymentError.status === 404) {
            setPayment(null)
            setActionErrorMessage(null)
          } else {
            setPayment(null)
            setActionErrorMessage(toFriendlyPaymentError(paymentError))
          }
        }
      } else {
        setPayment(null)
        setActionErrorMessage(null)
      }
    } catch (error) {
      if (activeRef && !activeRef.current) {
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
      if (!activeRef || activeRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    const activeRef = { current: true }
    setIsLoading(true)
    loadConfirmationData(activeRef)

    return () => {
      activeRef.current = false
    }
  }, [bookingId])

  useEffect(() => {
    if (!bookingId || paymentReturnStatus !== "success" || booking?.status !== "PENDING_PAYMENT") {
      return
    }

    let attempts = 0
    const interval = window.setInterval(async () => {
      attempts += 1
      setIsRefreshing(true)
      await loadConfirmationData()
      if (attempts >= 6 || booking?.status === "PAID") {
        window.clearInterval(interval)
      }
    }, 4000)

    return () => {
      window.clearInterval(interval)
    }
  }, [bookingId, booking?.status, paymentReturnStatus])

  const statusLabel = useMemo(() => {
    if (!booking) {
      return "Pending Payment"
    }

    return statusToLabel(booking.status)
  }, [booking])

  async function handlePayNow() {
    if (!booking || !service) {
      return
    }

    if (booking.status !== "PENDING_PAYMENT") {
      setActionErrorMessage("This booking is no longer pending payment. Refresh to see the latest status.")
      return
    }

    setIsPaying(true)
    setActionErrorMessage(null)

    try {
      const paymentIntent = await createPaymentIntent({
        bookingId: booking.id,
      })

      if (!paymentIntent.checkoutUrl) {
        throw new Error("Checkout URL was not returned by payment provider")
      }

      let checkoutHost: string
      try {
        checkoutHost = new URL(paymentIntent.checkoutUrl).hostname.toLowerCase()
      } catch {
        throw new Error("Invalid checkout URL returned by payment provider")
      }
      if (!checkoutHost.endsWith("paymongo.com")) {
        throw new Error("Unexpected checkout host returned by payment provider")
      }

      window.location.assign(paymentIntent.checkoutUrl)
    } catch (error) {
      setActionErrorMessage(toFriendlyPaymentError(error))
      setIsPaying(false)
    }
  }

  async function handleRefreshStatus() {
    setIsRefreshing(true)
    await loadConfirmationData()
  }

  if (isLoading) {
    return (
      <section className="bg-background py-8 lg:py-16">
        <div className="mx-auto max-w-lg px-4 text-sm text-muted-foreground lg:px-8">Loading booking confirmation...</div>
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

  const isPendingPayment = booking.status === "PENDING_PAYMENT"
  const isPaid = booking.status === "PAID"

  return (
    <section className="bg-background py-8 lg:py-16">
      <div className="mx-auto max-w-lg px-4 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isPaid ? "bg-success/10" : "bg-primary/10"}`}>
            <CheckCircle2 className={`h-8 w-8 ${isPaid ? "text-success" : "text-primary"}`} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isPendingPayment
              ? "Your booking is reserved. Complete payment to finalize your slot."
              : "Your booking is now in the system. Show your booking code at the shop."}
          </p>
        </div>

        {(paymentInitFailed || paymentReturnStatus === "cancel") && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Payment was not completed yet. You can retry payment below.
            </p>
          </div>
        )}

        {paymentReturnStatus === "success" && isPendingPayment && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
            <RefreshCw className={`mt-0.5 h-4 w-4 shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
            <p>We are syncing your payment status. This may take a few seconds.</p>
          </div>
        )}

        {actionErrorMessage && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {actionErrorMessage}
          </div>
        )}

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
                <Badge
                  variant="secondary"
                  className={isPaid ? "bg-success/10 text-success border-none font-medium" : "bg-amber-500/10 text-amber-700 border-none font-medium"}
                >
                  {statusLabel}
                </Badge>
              </div>
              {payment && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium text-foreground">{payment.status}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Amount</span>
                <span className="text-primary">PHP {(service?.price || 0).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Use your booking code to confirm drop-off at the shop counter.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {isPendingPayment && (
                <Button onClick={handlePayNow} className="w-full gap-2" disabled={isPaying}>
                  {isPaying ? "Redirecting to PayMongo..." : "Pay using Paymongo"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {isPendingPayment && (
                <Button variant="outline" className="w-full gap-2" onClick={handleRefreshStatus} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh Payment Status
                </Button>
              )}
              <Button variant="outline" className="w-full gap-2" disabled>
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              <Button asChild className="w-full gap-2">
                <Link to="/bookings">
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
