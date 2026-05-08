import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShopOwnerLayout } from "@/components/shop-owner/shop-owner-layout"
import { formatBackendTime, toIsoDateOnly } from "@/lib/booking-api"
import {
  createSlot,
  deleteSlot,
  listMyServices,
  listMySlots,
  updateSlot,
  type OwnerServiceApi,
  type OwnerSlotApi,
  type SlotConfigPayload,
} from "@/lib/owner-api"

type DraftSlot = {
  id?: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  maxSlots: string
}

function emptyDraft(date: string, serviceId: string): DraftSlot {
  return {
    serviceId,
    date,
    startTime: "09:00",
    endTime: "12:00",
    maxSlots: "3",
  }
}

function toBackendTimeFromInput(value: string): string {
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`
  return value
}

function toInputTime(value: string): string {
  const m = value.match(/^(\d{2}):(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : value
}

export function ScheduleManagement() {
  const [services, setServices] = useState<OwnerServiceApi[]>([])
  const [slots, setSlots] = useState<OwnerSlotApi[]>([])
  const [date, setDate] = useState<string>(toIsoDateOnly(new Date()))
  const [serviceFilter, setServiceFilter] = useState<string>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftSlot | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<OwnerSlotApi | null>(null)

  const priorityServices = useMemo(
    () => services.filter((s) => s.serviceType === "PRIORITY"),
    [services]
  )

  const refresh = async () => {
    setLoading(true)
    try {
      const params: { date: string; serviceId?: string } = { date }
      if (serviceFilter !== "ALL") params.serviceId = serviceFilter
      const list = await listMySlots(params)
      setSlots(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load slots")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listMyServices()
      .then(setServices)
      .catch((err: Error) => setError(err.message))
  }, [])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, serviceFilter])

  const startCreate = () => {
    if (priorityServices.length === 0) {
      setError("Add a PRIORITY service first before configuring slots.")
      return
    }
    setDraft(emptyDraft(date, priorityServices[0].id))
  }

  const startEdit = (slot: OwnerSlotApi) => {
    setDraft({
      id: slot.id,
      serviceId: slot.serviceId,
      date: slot.date,
      startTime: toInputTime(slot.startTime),
      endTime: toInputTime(slot.endTime),
      maxSlots: String(slot.maxSlots),
    })
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const max = Number(draft.maxSlots)
    if (Number.isNaN(max) || max < 1) {
      setError("Max slots must be at least 1")
      return
    }
    if (toBackendTimeFromInput(draft.endTime) <= toBackendTimeFromInput(draft.startTime)) {
      setError("End time must be after start time")
      return
    }
    const payload: SlotConfigPayload = {
      serviceId: draft.serviceId,
      date: draft.date,
      startTime: toBackendTimeFromInput(draft.startTime),
      endTime: toBackendTimeFromInput(draft.endTime),
      maxSlots: max,
    }
    setSaving(true)
    try {
      if (draft.id) {
        await updateSlot(draft.id, payload)
      } else {
        await createSlot(payload)
      }
      setDraft(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save slot")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteSlot(pendingDelete.id)
      setPendingDelete(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete slot")
    }
  }

  return (
    <ShopOwnerLayout
      title="Schedule"
      description="Configure priority slot windows and capacity for each day."
      actions={
        <Button onClick={startCreate} className="gap-2" disabled={priorityServices.length === 0}>
          <Plus className="h-4 w-4" />
          Add Slot Window
        </Button>
      }
    >
      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Slot Windows</CardTitle>
          <CardDescription>
            Each window defines a time range and the maximum number of priority bookings allowed within it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-date">Date</Label>
              <Input
                id="filter-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-service">Service</Label>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger id="filter-service" className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All priority services</SelectItem>
                  {priorityServices.map((svc) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No slot windows for this date. Click "Add Slot Window" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium text-foreground">{slot.serviceName}</TableCell>
                    <TableCell>
                      {formatBackendTime(slot.startTime)} – {formatBackendTime(slot.endTime)}
                    </TableCell>
                    <TableCell>{slot.maxSlots}</TableCell>
                    <TableCell>{slot.reserved}</TableCell>
                    <TableCell>{slot.available}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(slot)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(slot)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit Slot Window" : "Add Slot Window"}</DialogTitle>
            <DialogDescription>Define when priority bookings can be taken and how many.</DialogDescription>
          </DialogHeader>
          {draft && (
            <form onSubmit={handleSave} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="slot-service">Service</Label>
                <Select
                  value={draft.serviceId}
                  onValueChange={(val) => setDraft({ ...draft, serviceId: val })}
                >
                  <SelectTrigger id="slot-service">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityServices.map((svc) => (
                      <SelectItem key={svc.id} value={svc.id}>
                        {svc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slot-date">Date</Label>
                <Input
                  id="slot-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slot-start">Start Time</Label>
                  <Input
                    id="slot-start"
                    type="time"
                    value={draft.startTime}
                    onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slot-end">End Time</Label>
                  <Input
                    id="slot-end"
                    type="time"
                    value={draft.endTime}
                    onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slot-max">Max Slots</Label>
                <Input
                  id="slot-max"
                  type="number"
                  min={1}
                  value={draft.maxSlots}
                  onChange={(e) => setDraft({ ...draft, maxSlots: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete slot window?</DialogTitle>
            <DialogDescription>
              {pendingDelete && (
                <>
                  This removes the {formatBackendTime(pendingDelete.startTime)}–
                  {formatBackendTime(pendingDelete.endTime)} window for {pendingDelete.serviceName} on {pendingDelete.date}.
                  Existing bookings within it will remain but no new ones can be taken.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShopOwnerLayout>
  )
}
