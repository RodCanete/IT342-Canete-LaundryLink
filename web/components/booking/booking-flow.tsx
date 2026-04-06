"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, Clock, Upload, FileText, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ApiError } from "@/lib/api"
import {
  createBooking,
  createPaymentIntent,
  formatBackendTime,
  getShop,
  getSlots,
  listShopServices,
  toIsoDateOnly,
  type ServiceApi,
  type ShopApi,
  type SlotApi,
} from "@/lib/booking-api"

const steps = [
  { label: "Date", icon: Calendar },
  { label: "Time", icon: Clock },
  { label: "Upload", icon: Upload },
  { label: "Summary", icon: FileText },
]

type BookingFlowProps = {
  shopId: string
  preferredServiceId?: string
}

export function BookingFlow({ shopId, preferredServiceId }: BookingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [shop, setShop] = useState<ShopApi | null>(null)
  const [services, setServices] = useState<ServiceApi[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(preferredServiceId ?? null)
  const [slots, setSlots] = useState<SlotApi[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [serviceNotice, setServiceNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBookingContext() {
      setErrorMessage(null)
      setIsLoadingDetails(true)

      try {
        const [shopData, servicesData] = await Promise.all([getShop(shopId), listShopServices(shopId)])

        if (!active) {
          return
        }

        setShop(shopData)
        setServices(servicesData)
        const initialService =
          servicesData.find((service) => service.id === preferredServiceId) ??
          servicesData.find((service) => service.serviceType === "PRIORITY") ??
          servicesData[0] ??
          null
        setSelectedServiceId(initialService?.id ?? null)
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load booking details"
        )
      } finally {
        if (active) {
          setIsLoadingDetails(false)
        }
      }
    }

    loadBookingContext()

    return () => {
      active = false
    }
  }, [shopId])

  const selectedService = useMemo(() => {
    if (services.length === 0) {
      return null
    }

    if (selectedServiceId) {
      const selected = services.find((service) => service.id === selectedServiceId)
      if (selected) {
        return selected
      }
    }

    return services.find((service) => service.serviceType === "PRIORITY") ?? services[0]
  }, [selectedServiceId, services])

  useEffect(() => {
    setSelectedTime(null)
    setServiceNotice(null)

    if (!selectedService || !selectedDate) {
      setSlots([])
      return
    }

    const activeService = selectedService
    const activeDate = selectedDate

    let active = true

    async function loadSlots() {
      setIsLoadingSlots(true)
      setErrorMessage(null)

      try {
        const slotRows = await getSlots({
          shopId,
          serviceId: activeService.id,
          date: toIsoDateOnly(activeDate),
        })

        if (active) {
          setSlots(slotRows)
        }
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load available slots"
        )
        setSlots([])
      } finally {
        if (active) {
          setIsLoadingSlots(false)
        }
      }
    }

    loadSlots()

    return () => {
      active = false
    }
  }, [selectedDate, selectedService, shopId])

  useEffect(() => {
    if (!selectedDate || !selectedService || isLoadingSlots) {
      return
    }

    const activeService = selectedService
    const availableForSelected = getAvailableCount(slots)
    if (availableForSelected > 0) {
      return
    }

    let active = true
    const selectedDateText = toIsoDateOnly(selectedDate)

    async function switchToServiceWithSlots() {
      const candidates = services.filter(
        (service) => service.id !== activeService.id && service.serviceType === activeService.serviceType
      )

      for (const candidate of candidates) {
        try {
          const candidateSlots = await getSlots({
            shopId,
            serviceId: candidate.id,
            date: selectedDateText,
          })

          if (!active) {
            return
          }

          if (getAvailableCount(candidateSlots) > 0) {
            setSelectedServiceId(candidate.id)
            setServiceNotice(
              `No slots for ${activeService.name}. Switched to ${candidate.name}, which has available slots.`
            )
            return
          }
        } catch {
          // Try next candidate if one service cannot be loaded.
        }
      }

      if (active) {
        setServiceNotice(`No slots are configured for ${activeService.name} on ${selectedDateText}.`)
      }
    }

    switchToServiceWithSlots()

    return () => {
      active = false
    }
  }, [isLoadingSlots, selectedDate, selectedService, services, shopId, slots])

  const canProceed = () => {
    if (currentStep === 0) {
      return !!selectedDate
    }

    if (currentStep === 1) {
      return !!selectedTime
    }

    return true
  }

  async function handleSubmitBooking() {
    const activeDate = selectedDate
    const activeService = selectedService
    const activeTime = selectedTime

    if (!activeDate || !activeService || !activeTime) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const booking = await createBooking({
        shopId,
        serviceId: activeService.id,
        date: toIsoDateOnly(activeDate),
        timeSlot: activeTime,
      })

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
      } catch (paymentError) {
        console.error("Failed to initialize payment", paymentError)
        router.push(
          `/bookings/confirmation?bookingId=${encodeURIComponent(booking.id)}&paymentInitFailed=1`
        )
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to create booking"
      )
      setIsSubmitting(false)
    }
  }

  if (isLoadingDetails) {
    return (
      <section className="bg-background py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8 text-sm text-muted-foreground">Loading booking details...</div>
      </section>
    )
  }

  if (!shop || !selectedService) {
    return (
      <section className="bg-background py-8 lg:py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage || "Booking details are unavailable for this shop."}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <Link
          href={`/shops/${shopId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Book a Slot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {shop.name} - {selectedService.name}
          </p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      i < currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : i === currentStep
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {i < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      i <= currentStep ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 mt-[-20px] h-0.5 flex-1 ${
                      i < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {errorMessage && (
          <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Card className="border-border">
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">Select a Date</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose your preferred drop-off date
                  </p>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-lg border border-border"
                />
                {selectedDate && (
                  <Badge variant="secondary" className="text-sm">
                    Selected: {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Badge>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">Select a Time Slot</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose an available time slot for drop-off
                  </p>
                </div>
                {isLoadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading available slots...</p>
                ) : slots.length === 0 ? (
                  <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                    No slots available for the selected date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slots.map((slot) => {
                      const isUnavailable = slot.available <= 0
                      const isSelected = selectedTime === slot.startTime
                      return (
                        <button
                          key={slot.slotConfigId}
                          onClick={() => !isUnavailable && setSelectedTime(slot.startTime)}
                          disabled={isUnavailable}
                          className={`flex flex-col items-center justify-center rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : isUnavailable
                              ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50"
                              : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <span>{formatBackendTime(slot.startTime)}</span>
                          <span className="text-xs opacity-80">{slot.available} available</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {serviceNotice && (
                  <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                    {serviceNotice}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded border border-border bg-background" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-primary" />
                    Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded bg-muted" />
                    Unavailable
                  </span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">Upload Instructions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Optional: attach a laundry photo or special instruction file
                  </p>
                </div>
                {!uploadedFile ? (
                  <label className="group flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Image or PDF, max 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={() => setUploadedFile("laundry-instructions.pdf")}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
                      <p className="text-xs text-muted-foreground">PDF document</p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground">Booking Summary</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review your booking details before payment
                  </p>
                </div>
                <Card className="border-border bg-secondary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{shop.address}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Service</span>
                      <Badge className="bg-primary text-primary-foreground">{selectedService.name}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "long",
                          day: "numeric",
                        }) || "Not selected"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time Slot</span>
                      <span className="font-medium text-foreground">{selectedTime ? formatBackendTime(selectedTime) : "Not selected"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">File Attached</span>
                      <span className="font-medium text-foreground">
                        {uploadedFile || "None"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">PHP {selectedService.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0 || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitBooking} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Creating booking..." : "Proceed to Payment"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function getAvailableCount(slots: SlotApi[]): number {
  return slots.reduce((total, slot) => total + Math.max(0, slot.available), 0)
}
