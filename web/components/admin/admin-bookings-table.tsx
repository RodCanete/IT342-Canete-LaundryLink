"use client"

import { useState } from "react"
import { Search, Filter, FileText, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type BookingStatus = "Pending Payment" | "Paid" | "Dropped Off" | "Processing" | "Completed"

const adminBookings = [
  { id: "BK-001", code: "LL-2026-0312", customer: "Maria Santos", email: "maria@email.com", shop: "FreshSpin Laundry Hub", service: "Priority", date: "Mar 15, 2026", time: "10:00 AM", status: "Paid" as BookingStatus, amount: 200, hasFile: true },
  { id: "BK-002", code: "LL-2026-0298", customer: "Juan Dela Cruz", email: "juan@email.com", shop: "CleanWave Express", service: "Standard", date: "Mar 10, 2026", time: "02:00 PM", status: "Completed" as BookingStatus, amount: 100, hasFile: false },
  { id: "BK-003", code: "LL-2026-0305", customer: "Ana Reyes", email: "ana@email.com", shop: "Sparkle & Fold", service: "Priority", date: "Mar 12, 2026", time: "08:00 AM", status: "Processing" as BookingStatus, amount: 220, hasFile: true },
  { id: "BK-004", code: "LL-2026-0320", customer: "Carlos Tan", email: "carlos@email.com", shop: "QuickDry Laundromat", service: "Standard", date: "Mar 18, 2026", time: "11:00 AM", status: "Pending Payment" as BookingStatus, amount: 110, hasFile: false },
  { id: "BK-005", code: "LL-2026-0287", customer: "Sofia Lim", email: "sofia@email.com", shop: "FreshSpin Laundry Hub", service: "Priority", date: "Mar 8, 2026", time: "09:00 AM", status: "Dropped Off" as BookingStatus, amount: 200, hasFile: false },
  { id: "BK-006", code: "LL-2026-0330", customer: "Diego Cruz", email: "diego@email.com", shop: "BrightWash Laundry", service: "Priority", date: "Mar 20, 2026", time: "07:00 AM", status: "Paid" as BookingStatus, amount: 195, hasFile: true },
  { id: "BK-007", code: "LL-2026-0315", customer: "Lea Fernandez", email: "lea@email.com", shop: "CleanWave Express", service: "Standard", date: "Mar 14, 2026", time: "03:00 PM", status: "Completed" as BookingStatus, amount: 100, hasFile: false },
]

const statusConfig: Record<BookingStatus, { color: string; bg: string }> = {
  "Pending Payment": { color: "text-warning", bg: "bg-warning/10" },
  Paid: { color: "text-success", bg: "bg-success/10" },
  "Dropped Off": { color: "text-primary", bg: "bg-primary/10" },
  Processing: { color: "text-accent", bg: "bg-accent/10" },
  Completed: { color: "text-muted-foreground", bg: "bg-muted" },
}

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  "Pending Payment": [],
  Paid: ["Dropped Off"],
  "Dropped Off": ["Processing"],
  Processing: ["Completed"],
  Completed: [],
}

export function AdminBookingsTable() {
  const [data, setData] = useState(adminBookings)

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    setData((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
  }

  const statusCounts = {
    all: data.length,
    paid: data.filter((b) => b.status === "Paid").length,
    droppedOff: data.filter((b) => b.status === "Dropped Off").length,
    processing: data.filter((b) => b.status === "Processing").length,
    completed: data.filter((b) => b.status === "Completed").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{statusCounts.all}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{statusCounts.paid}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{statusCounts.droppedOff}</p>
            <p className="text-xs text-muted-foreground">Dropped Off</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{statusCounts.processing}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card className="border-border col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{statusCounts.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by customer name or booking code..." className="pl-10" />
        </div>
        <Input type="date" className="w-auto sm:w-44" />
        <Select>
          <SelectTrigger className="w-auto sm:w-44">
            <SelectValue placeholder="All Shops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shops</SelectItem>
            <SelectItem value="freshspin">FreshSpin Laundry Hub</SelectItem>
            <SelectItem value="cleanwave">CleanWave Express</SelectItem>
            <SelectItem value="sparkle">Sparkle & Fold</SelectItem>
            <SelectItem value="quickdry">QuickDry Laundromat</SelectItem>
            <SelectItem value="brightwash">BrightWash Laundry</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Shop</TableHead>
                  <TableHead className="hidden sm:table-cell">Service</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs font-medium">{booking.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{booking.customer}</p>
                        <p className="text-xs text-muted-foreground">{booking.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">{booking.shop}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className={
                          booking.service === "Priority"
                            ? "bg-primary/10 text-primary border-none"
                            : "bg-secondary text-secondary-foreground border-none"
                        }
                      >
                        {booking.service}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">{booking.date}</TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">{booking.time}</TableCell>
                    <TableCell>
                      {allowedTransitions[booking.status].length > 0 ? (
                        <Select
                          value={booking.status}
                          onValueChange={(val) => updateStatus(booking.id, val as BookingStatus)}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={booking.status}>{booking.status}</SelectItem>
                            {allowedTransitions[booking.status].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={`border-none ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}
                        >
                          {booking.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.hasFile && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Download file">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Download attached file</span>
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View booking details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 py-4 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono font-medium">{booking.code}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{booking.customer}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{booking.email}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Shop</span><span className="font-medium">{booking.shop}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{booking.service}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{booking.date}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{booking.time}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                                <Badge variant="secondary" className={`border-none ${statusConfig[booking.status].bg} ${statusConfig[booking.status].color}`}>
                                  {booking.status}
                                </Badge>
                              </div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">PHP {booking.amount}</span></div>
                              <Separator />
                              <div className="flex justify-between"><span className="text-muted-foreground">File</span><span>{booking.hasFile ? "Attached" : "None"}</span></div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
