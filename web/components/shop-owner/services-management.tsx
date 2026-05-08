import { useEffect, useState, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import type { ServiceType } from "@/lib/booking-api"
import {
  createService,
  deleteService,
  listMyServices,
  updateService,
  type OwnerServiceApi,
  type ServicePayload,
} from "@/lib/owner-api"

type DraftService = {
  id?: string
  name: string
  serviceType: ServiceType
  price: string
}

const EMPTY_DRAFT: DraftService = { name: "", serviceType: "STANDARD", price: "" }

export function ServicesManagement() {
  const [services, setServices] = useState<OwnerServiceApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftService | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<OwnerServiceApi | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const list = await listMyServices()
      setServices(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const startCreate = () => setDraft({ ...EMPTY_DRAFT })
  const startEdit = (svc: OwnerServiceApi) =>
    setDraft({
      id: svc.id,
      name: svc.name,
      serviceType: svc.serviceType,
      price: String(svc.price),
    })

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!draft) return
    const priceNum = Number(draft.price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a non-negative number")
      return
    }
    const payload: ServicePayload = {
      name: draft.name.trim(),
      serviceType: draft.serviceType,
      price: priceNum,
    }
    setSaving(true)
    try {
      if (draft.id) {
        await updateService(draft.id, payload)
      } else {
        await createService(payload)
      }
      setDraft(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteService(pendingDelete.id)
      setPendingDelete(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service")
    }
  }

  return (
    <ShopOwnerLayout
      title="Services"
      description="Manage the services offered at your shop and their pricing."
      actions={
        <Button onClick={startCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
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
          <CardTitle className="text-base">Service Catalog</CardTitle>
          <CardDescription>
            STANDARD services are always available; PRIORITY services use slot configurations from the Schedule page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No services yet. Click "Add Service" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium text-foreground">{svc.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          svc.serviceType === "PRIORITY"
                            ? "border-none bg-primary/10 text-primary"
                            : "border-none bg-secondary text-secondary-foreground"
                        }
                      >
                        {svc.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell>PHP {Number(svc.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(svc)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete(svc)}
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

      {/* Create / Edit dialog */}
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>Service details visible to customers.</DialogDescription>
          </DialogHeader>
          {draft && (
            <form onSubmit={handleSave} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="svc-name">Name</Label>
                <Input
                  id="svc-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="svc-type">Type</Label>
                <Select
                  value={draft.serviceType}
                  onValueChange={(val) => setDraft({ ...draft, serviceType: val as ServiceType })}
                >
                  <SelectTrigger id="svc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PRIORITY">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="svc-price">Price (PHP)</Label>
                <Input
                  id="svc-price"
                  type="number"
                  step="0.01"
                  min={0}
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
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

      {/* Delete confirmation */}
      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              This will permanently remove "{pendingDelete?.name}". Existing bookings tied to this service will keep their record.
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
