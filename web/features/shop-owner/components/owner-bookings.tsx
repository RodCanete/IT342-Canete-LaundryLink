import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Eye, FileText } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Separator } from "@/shared/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { ShopOwnerLayout } from "@/features/shop-owner/components/shop-owner-layout"
import {
  formatBackendTime,
  formatBookingDate,
  statusToLabel,
  type BookingStatusApi,
} from "@/features/booking/api/booking-api"
import {
  listMyOwnerBookings,
  updateBookingStatus,
  type OwnerBookingApi,
} from "@/features/shop-owner/api/owner-api"

const ALLOWED_NEXT: Record<BookingStatusApi, BookingStatusApi[]> = {
  PENDING_PAYMENT: [],
  PAID: ["DROPPED_OFF"],
  DROPPED_OFF: ["PROCESSING"],
  PROCESSING: ["COMPLETED"],
  COMPLETED: [],
}

const STATUS_TONE: Record<BookingStatusApi, string> = {
  PENDING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-success/10 text-success",
  DROPPED_OFF: "bg-primary/10 text-primary",
  PROCESSING: "bg-accent/10 text-accent",
  COMPLETED: "bg-muted text-muted-foreground",
}

const STATUS_OPTIONS: BookingStatusApi[] = [
  "PENDING_PAYMENT",
  "PAID",
  "DROPPED_OFF",
  "PROCESSING",
  "COMPLETED",
]

type PendingChange = {
  timeoutId: ReturnType<typeof setTimeout>
  next: BookingStatusApi
  prev: BookingStatusApi
}

export function OwnerBookings() {
  const [bookings, setBookings] = useState<OwnerBookingApi[]>([])
  const [date, setDate] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const pendingRef = useRef<Map<string, PendingChange>>(new Map())
  const [viewing, setViewing] = useState<OwnerBookingApi | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const params: { date?: string; status?: BookingStatusApi } = {}
      if (date) params.date = date
      if (statusFilter !== "ALL") params.status = statusFilter as BookingStatusApi
      const list = await listMyOwnerBookings(params)
      setBookings(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, statusFilter])

  // Flush any pending changes on unmount so no updates are silently lost
  useEffect(() => {
    const ref = pendingRef.current
    return () => {
      ref.forEach(({ timeoutId, next }, bookingId) => {
        clearTimeout(timeoutId)
        updateBookingStatus(bookingId, next).catch(() => {})
      })
    }
  }, [])

  const commitChange = async (bookingId: string, next: BookingStatusApi, prev: BookingStatusApi) => {
    pendingRef.current.delete(bookingId)
    setPendingIds((ids) => { const s = new Set(ids); s.delete(bookingId); return s })
    setUpdatingId(bookingId)
    try {
      const updated = await updateBookingStatus(bookingId, next)
      setBookings((b) => b.map((bk) => (bk.id === bookingId ? updated : bk)))
      setError(null)
    } catch (err) {
      setBookings((b) => b.map((bk) => (bk.id === bookingId ? { ...bk, status: prev } : bk)))
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = (booking: OwnerBookingApi, next: BookingStatusApi) => {
    if (next === booking.status) return
    const prev = booking.status

    setBookings((b) => b.map((bk) => (bk.id === booking.id ? { ...bk, status: next } : bk)))
    setPendingIds((ids) => new Set([...ids, booking.id]))

    const timeoutId = setTimeout(() => commitChange(booking.id, next, prev), 6000)
    pendingRef.current.set(booking.id, { timeoutId, next, prev })

    toast(`Status updated to "${statusToLabel(next)}"`, {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          const pending = pendingRef.current.get(booking.id)
          if (!pending) return
          clearTimeout(pending.timeoutId)
          pendingRef.current.delete(booking.id)
          setPendingIds((ids) => { const s = new Set(ids); s.delete(booking.id); return s })
          setBookings((b) => b.map((bk) => (bk.id === booking.id ? { ...bk, status: prev } : bk)))
        },
      },
    })
  }

  const counts = {
    total: bookings.length,
    paid: bookings.filter((b) => b.status === "PAID").length,
    droppedOff: bookings.filter((b) => b.status === "DROPPED_OFF").length,
    processing: bookings.filter((b) => b.status === "PROCESSING").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  }

  return (
    <ShopOwnerLayout
      title="Bookings"
      description="Customer bookings at your shop. Advance status as the laundry progresses."
    >
      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{counts.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{counts.paid}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{counts.droppedOff}</p>
            <p className="text-xs text-muted-foreground">Dropped Off</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{counts.processing}</p>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card className="border-border col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{counts.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All Bookings</CardTitle>
          <CardDescription>Filter by date or status, then advance bookings as they move through your shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bk-date">Date</Label>
              <Input
                id="bk-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bk-status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="bk-status" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusToLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(date || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDate("")
                  setStatusFilter("ALL")
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings match the current filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Service</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const allowed = ALLOWED_NEXT[booking.status]
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs font-medium">{booking.bookingCode}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-foreground">{booking.customerName}</p>
                            <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="secondary"
                            className={
                              booking.serviceType === "PRIORITY"
                                ? "border-none bg-primary/10 text-primary"
                                : "border-none bg-secondary text-secondary-foreground"
                            }
                          >
                            {booking.serviceName}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm lg:table-cell">
                          {formatBookingDate(booking.bookingDate)}
                        </TableCell>
                        <TableCell className="hidden text-sm lg:table-cell">
                          {formatBackendTime(booking.timeSlot)}
                        </TableCell>
                        <TableCell>
                          {allowed.length > 0 ? (
                            <Select
                              value={booking.status}
                              onValueChange={(val) => handleStatusChange(booking, val as BookingStatusApi)}
                              disabled={updatingId === booking.id || pendingIds.has(booking.id)}
                            >
                              <SelectTrigger className="h-8 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={booking.status}>{statusToLabel(booking.status)}</SelectItem>
                                {allowed.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {statusToLabel(s)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="secondary" className={`border-none ${STATUS_TONE[booking.status]}`}>
                              {statusToLabel(booking.status)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {booking.fileUrl && (
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Open attached file">
                                <a href={booking.fileUrl} target="_blank" rel="noreferrer">
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setViewing(booking)}
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Booking Details</DialogTitle>
                                </DialogHeader>
                                {viewing && viewing.id === booking.id && (
                                  <div className="flex flex-col gap-3 py-4 text-sm">
                                    <Row label="Code" value={viewing.bookingCode} mono />
                                    <Separator />
                                    <Row label="Customer" value={viewing.customerName} />
                                    <Separator />
                                    <Row label="Email" value={viewing.customerEmail} />
                                    <Separator />
                                    <Row label="Service" value={`${viewing.serviceName} (${viewing.serviceType})`} />
                                    <Separator />
                                    <Row label="Date" value={formatBookingDate(viewing.bookingDate)} />
                                    <Separator />
                                    <Row label="Time" value={formatBackendTime(viewing.timeSlot)} />
                                    <Separator />
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge variant="secondary" className={`border-none ${STATUS_TONE[viewing.status]}`}>
                                        {statusToLabel(viewing.status)}
                                      </Badge>
                                    </div>
                                    <Separator />
                                    <Row label="Amount" value={`PHP ${Number(viewing.servicePrice).toFixed(2)}`} bold />
                                    <Separator />
                                    <Row label="File" value={viewing.fileUrl ? "Attached" : "None"} />
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ShopOwnerLayout>
  )
}

function Row({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={[mono ? "font-mono" : "", bold ? "font-semibold" : "font-medium"].join(" ").trim()}>
        {value}
      </span>
    </div>
  )
}
