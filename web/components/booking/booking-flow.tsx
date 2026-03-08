"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Clock, Upload, FileText, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

const timeSlots = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
]

const unavailableSlots = ["09:00 AM", "02:00 PM", "05:00 PM"]

const steps = [
  { label: "Date", icon: Calendar },
  { label: "Time", icon: Clock },
  { label: "Upload", icon: Upload },
  { label: "Summary", icon: FileText },
]

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const canProceed = () => {
    if (currentStep === 0) return !!selectedDate
    if (currentStep === 1) return !!selectedTime
    return true
  }

  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <Link
          href="/shops/1"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Book a Slot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            FreshSpin Laundry Hub - Priority Wash & Fold
          </p>
        </div>

        {/* Step Indicator */}
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

        {/* Step Content */}
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
                  disabled={(date) => date < new Date()}
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
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {timeSlots.map((time) => {
                    const isUnavailable = unavailableSlots.includes(time)
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        onClick={() => !isUnavailable && setSelectedTime(time)}
                        disabled={isUnavailable}
                        className={`flex items-center justify-center rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : isUnavailable
                            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
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
                    <CardTitle className="text-base">FreshSpin Laundry Hub</CardTitle>
                    <p className="text-xs text-muted-foreground">123 Osmeña Blvd, Cebu City</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Service</span>
                      <Badge className="bg-primary text-primary-foreground">Priority Wash & Fold</Badge>
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
                      <span className="font-medium text-foreground">{selectedTime || "Not selected"}</span>
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
                      <span className="text-primary">PHP 200.00</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link href="/bookings/confirmation">
                Proceed to Payment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
