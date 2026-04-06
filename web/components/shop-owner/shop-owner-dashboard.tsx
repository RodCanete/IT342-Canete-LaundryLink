import Link from "next/link"
import { CalendarCheck2, Landmark, Settings2, Sparkles, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const shopMetrics = [
  { label: "Today's Bookings", value: "18", icon: CalendarCheck2, tone: "text-primary" },
  { label: "Priority Slots Used", value: "7 / 10", icon: Sparkles, tone: "text-accent" },
  { label: "Active Customers", value: "42", icon: Users, tone: "text-success" },
  { label: "Shop Status", value: "Open", icon: Landmark, tone: "text-warning" },
]

const recentBookings = [
  { code: "LL-2026-0411", customer: "Maria Santos", service: "Priority", status: "Paid", time: "10:00 AM" },
  { code: "LL-2026-0412", customer: "Juan Dela Cruz", service: "Standard", status: "Dropped Off", time: "10:30 AM" },
  { code: "LL-2026-0413", customer: "Ana Reyes", service: "Priority", status: "Processing", time: "11:00 AM" },
]

const slotSummary = [
  { date: "Today", limit: 10, used: 7 },
  { date: "Tomorrow", limit: 10, used: 5 },
  { date: "Apr 08", limit: 10, used: 9 },
]

export function ShopOwnerDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Settings2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">LaundryLink</p>
            <p className="text-[10px] text-muted-foreground">Shop Owner Dashboard</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          <Link href="/shop-owner/dashboard" className="rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
            Overview
          </Link>
          <Link href="/shops" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            View Shops
          </Link>
          <Link href="/bookings" className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            Customer Bookings
          </Link>
        </nav>
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          Separate dashboard for shop operations and booking management.
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-border bg-background/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="secondary" className="mb-2 border-none bg-primary/10 text-primary">
                Shop Owner Dashboard
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Operations overview</h1>
              <p className="mt-1 text-sm text-muted-foreground">Monitor bookings, capacity, and slot limits for your laundromat.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/shop-owner/dashboard">Refresh View</Link>
              </Button>
              <Button asChild>
                <Link href="/shops">Open Shop List</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-8 bg-gradient-to-b from-background via-background to-muted/20 px-4 py-8 lg:px-8">
          <div className="grid gap-4 xl:grid-cols-4">
            {shopMetrics.map((metric) => (
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

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Recent Bookings</CardTitle>
                <CardDescription>Review the latest customer bookings and queue state.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={booking.code}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{booking.customer}</p>
                          <p className="text-xs text-muted-foreground">{booking.code} · {booking.service} · {booking.time}</p>
                        </div>
                        <Badge variant="secondary" className="border-none bg-primary/10 text-primary">
                          {booking.status}
                        </Badge>
                      </div>
                      {index < recentBookings.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Priority Slot Limits</CardTitle>
                <CardDescription>Track daily capacity and adjust allocations as demand changes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {slotSummary.map((slot) => {
                  const ratio = Math.round((slot.used / slot.limit) * 100)
                  return (
                    <div key={slot.date} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{slot.date}</span>
                        <span className="text-muted-foreground">{slot.used} / {slot.limit}</span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  )
                })}
                <Button className="w-full" variant="outline">
                  Manage Slot Limits
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}