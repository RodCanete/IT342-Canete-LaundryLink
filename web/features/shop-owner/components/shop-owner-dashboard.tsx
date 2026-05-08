import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarCheck2, Landmark, Sparkles, Users } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { ShopOwnerLayout } from "@/features/shop-owner/components/shop-owner-layout"
import {
  formatBackendTime,
  formatBookingDate,
  statusToLabel,
} from "@/features/booking/api/booking-api"
import {
  getOwnerDashboard,
  type OwnerDashboardApi,
} from "@/features/shop-owner/api/owner-api"

function formatSlotDate(dateString: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateString}T00:00:00`)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  return target.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ShopOwnerDashboard() {
  const [data, setData] = useState<OwnerDashboardApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOwnerDashboard()
      .then((res) => {
        if (!cancelled) {
          setData(res)
          setError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const slotRatio =
    data && data.prioritySlotsCapacity > 0
      ? `${data.prioritySlotsUsed} / ${data.prioritySlotsCapacity}`
      : "0 / 0"

  const metrics = [
    { label: "Today's Bookings", value: data?.todaysBookings ?? 0, icon: CalendarCheck2, tone: "text-primary" },
    { label: "Priority Slots Used", value: slotRatio, icon: Sparkles, tone: "text-accent" },
    { label: "Active Customers", value: data?.activeCustomers ?? 0, icon: Users, tone: "text-success" },
    { label: "Shop Status", value: data?.shop ? "Open" : "—", icon: Landmark, tone: "text-warning" },
  ]

  return (
    <ShopOwnerLayout
      title="Operations overview"
      description="Monitor bookings, capacity, and slot limits for your laundromat."
      actions={
        <>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button asChild>
            <Link to="/shop-owner/schedule">Manage Schedule</Link>
          </Button>
        </>
      }
    >
      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load dashboard: {error}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 ${metric.tone}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "—" : metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <CardDescription>The latest customer bookings at your shop.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !data || data.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {data.recentBookings.map((booking, index) => (
                  <div key={booking.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.bookingCode} · {booking.serviceName} ·{" "}
                          {formatBookingDate(booking.bookingDate)} {formatBackendTime(booking.timeSlot)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="border-none bg-primary/10 text-primary">
                        {statusToLabel(booking.status)}
                      </Badge>
                    </div>
                    {index < data.recentBookings.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Priority Slot Capacity</CardTitle>
            <CardDescription>Slot usage for the next 3 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !data || data.slotSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slot configurations.</p>
            ) : (
              data.slotSummary.map((slot) => {
                const ratio = slot.limit > 0 ? Math.round((slot.used / slot.limit) * 100) : 0
                return (
                  <div key={slot.date} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{formatSlotDate(slot.date)}</span>
                      <span className="text-muted-foreground">
                        {slot.used} / {slot.limit}
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
            <Button asChild className="w-full" variant="outline">
              <Link to="/shop-owner/schedule">Manage Slot Limits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ShopOwnerLayout>
  )
}
