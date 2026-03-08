import Link from "next/link"
import { CheckCircle2, Download, QrCode, ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function BookingConfirmation() {
  return (
    <section className="bg-background py-8 lg:py-16">
      <div className="mx-auto max-w-lg px-4 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment was successful. A receipt has been sent to your email.
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
                <p className="text-xl font-bold tracking-widest text-foreground">LL-2026-0312</p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shop</span>
                <span className="font-medium text-foreground">FreshSpin Laundry Hub</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <Badge className="bg-primary text-primary-foreground">Priority</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">Sat, March 15, 2026</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Slot</span>
                <span className="font-medium text-foreground">10:00 AM</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-none font-medium">
                  Paid
                </Badge>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-foreground">Amount Paid</span>
                <span className="text-primary">PHP 200.00</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">
                A confirmation receipt with your QR code has been sent to your registered email address.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full gap-2">
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
