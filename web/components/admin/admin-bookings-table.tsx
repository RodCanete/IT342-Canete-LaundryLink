import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Search, FileText, Eye } from "lucide-react"
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
import {
  formatBackendTime,
  formatBookingDate,
  statusToLabel,
  type BookingStatusApi,
} from "@/lib/booking-api"
import {
  listAdminBookings,
  listAdminShops,
  updateAdminBookingStatus,
  type AdminBookingApi,
  type AdminShopUsageApi,
} from "@/lib/admin-api"

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

type PendingChange = {
  timeoutId: ReturnType<typeof setTimeout>
  next: BookingStatusApi
  prev: BookingStatusApi
}

export function AdminBookingsTable() {
  const [bookings, setBookings] = useState<AdminBookingApi[]>([])
  const [shops, setShops] = useState<AdminShopUsageApi[]>([])
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [date, setDate] = useState("")
  const [shopId, setShopId] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const pendingRef = useRef<Map<string, PendingChange>>(new Map())
  const [viewing, setViewing] = useState<AdminBookingApi | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  useEffect(() => {
    listAdminShops()
      .then(setShops)
      .catch(() => {
        // shop list is non-fatal for the table itself
      })
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const params: Parameters<typeof listAdminBookings>[0] = {}
      if (date) params.date = date
      if (shopId !== "ALL") params.shopId = shopId
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim()
      const list = await listAdminBookings(params)
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
  }, [date, shopId, debouncedSearch])

  useEffect(() => {
    const ref = pendingRef.current
    return () => {
      ref.forEach(({ timeoutId, next }, bookingId) => {
        clearTimeout(timeoutId)
        updateAdminBookingStatus(bookingId, next).catch(() => {})
      })
    }
  }, [])

  const commitChange = async (
    bookingId: string,
    next: BookingStatusApi,
    prev: BookingStatusApi
  ) => {
    pendingRef.current.delete(bookingId)
    setPendingIds((ids) => {
      const s = new Set(ids)
      s.delete(bookingId)
      return s
    })
    setUpdatingId(bookingId)
    try {
      const updated = await updateAdminBookingStatus(bookingId, next)
      setBookings((b) => b.map((bk) => (bk.id === bookingId ? updated : bk)))
      setError(null)
    } catch (err) {
      setBookings((b) => b.map((bk) => (bk.id === bookingId ? { ...bk, status: prev } : bk)))
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = (booking: AdminBookingApi, next: BookingStatusApi) => {
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
          setPendingIds((ids) => {
            const s = new Set(ids)
            s.delete(booking.id)
            return s
          })
          setBookings((b) =>
            b.map((bk) => (bk.id === booking.id ? { ...bk, status: prev } : bk))
          )
        },
      },
    })
  }

  const counts = useMemo(
    () => ({
      total: bookings.length,
      paid: bookings.filter((b) => b.status === "PAID").length,
      droppedOff: bookings.filter((b) => b.status === "DROPPED_OFF").length,
      processing: bookings.filter((b) => b.status === "PROCESSING").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
    }),
    [bookings]
  )

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, email, or booking code..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          type="date"
          className="w-auto sm:w-44"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select value={shopId} onValueChange={setShopId}>
          <SelectTrigger className="w-auto sm:w-56">
            <SelectValue placeholder="All Shops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Shops</SelectItem>
            {shops.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || date || shopId !== "ALL") && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setDate("")
              setShopId("ALL")
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bookings</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableHead className="hidden md:table-cell">Shop</TableHead>
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
                        <TableCell className="font-mono text-xs font-medium">
                          {booking.bookingCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {booking.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-sm md:table-cell">
                          {booking.shopName}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant="secondary"
                            className={
                              booking.serviceType === "PRIORITY"
                                ? "bg-primary/10 text-primary border-none"
                                : "bg-secondary text-secondary-foreground border-none"
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
                              onValueChange={(val) =>
                                handleStatusChange(booking, val as BookingStatusApi)
                              }
                              disabled={updatingId === booking.id || pendingIds.has(booking.id)}
                            >
                              <SelectTrigger className="h-8 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={booking.status}>
                                  {statusToLabel(booking.status)}
                                </SelectItem>
                                {allowed.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {statusToLabel(s)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="secondary"
                              className={`border-none ${STATUS_TONE[booking.status]}`}
                            >
                              {statusToLabel(booking.status)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {booking.fileUrl && (
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Open attached file"
                              >
                                <a href={booking.fileUrl} target="_blank" rel="noreferrer">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Open attached file</span>
                                </a>
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="View details"
                                  onClick={() => setViewing(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View booking details</span>
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
                                    <Row label="Shop" value={viewing.shopName} />
                                    <Separator />
                                    <Row
                                      label="Service"
                                      value={`${viewing.serviceName} (${viewing.serviceType})`}
                                    />
                                    <Separator />
                                    <Row label="Date" value={formatBookingDate(viewing.bookingDate)} />
                                    <Separator />
                                    <Row label="Time" value={formatBackendTime(viewing.timeSlot)} />
                                    <Separator />
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status</span>
                                      <Badge
                                        variant="secondary"
                                        className={`border-none ${STATUS_TONE[viewing.status]}`}
                                      >
                                        {statusToLabel(viewing.status)}
                                      </Badge>
                                    </div>
                                    <Separator />
                                    <Row
                                      label="Amount"
                                      value={`PHP ${Number(viewing.servicePrice).toFixed(2)}`}
                                      bold
                                    />
                                    <Separator />
                                    <Row
                                      label="File"
                                      value={viewing.fileUrl ? "Attached" : "None"}
                                    />
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
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  bold,
}: {
  label: string
  value: string
  mono?: boolean
  bold?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={[mono ? "font-mono" : "", bold ? "font-semibold" : "font-medium"]
          .join(" ")
          .trim()}
      >
        {value}
      </span>
    </div>
  )
}
