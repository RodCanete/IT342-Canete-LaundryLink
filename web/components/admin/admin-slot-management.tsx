import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings2, Save } from "lucide-react"
import {
  listAdminShops,
  setShopDailyPriorityLimit,
  type AdminShopUsageApi,
} from "@/lib/admin-api"

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function AdminSlotManagement() {
  const [shops, setShops] = useState<AdminShopUsageApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedShop, setSelectedShop] = useState<string | undefined>(undefined)
  const [slotDate, setSlotDate] = useState(todayIso())
  const [newLimit, setNewLimit] = useState("")
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const list = await listAdminShops()
      setShops(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shops")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShop || !slotDate || !newLimit) {
      toast.error("Please fill in shop, date, and limit.")
      return
    }
    const max = Number(newLimit)
    if (!Number.isInteger(max) || max < 1) {
      toast.error("Max slots must be a positive integer.")
      return
    }
    setSaving(true)
    try {
      await setShopDailyPriorityLimit({
        shopId: selectedShop,
        date: slotDate,
        maxSlots: max,
      })
      toast.success("Slot limit updated.")
      setNewLimit("")
      await refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update slot limit"
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Slot Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure daily Priority slot limits per shop and monitor utilization.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : shops.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shops found.</p>
        ) : (
          shops.map((shop) => {
            const limit = shop.currentLimit
            const used = shop.usedToday
            const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0
            const isNearFull = limit > 0 && percentage >= 80
            return (
              <Card key={shop.id} className="border-border">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground">{shop.name}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Priority Slots Used Today</span>
                    <Badge
                      variant="secondary"
                      className={`border-none ${
                        limit === 0
                          ? "bg-muted text-muted-foreground"
                          : isNearFull
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {used} / {limit}
                    </Badge>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isNearFull ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-xs text-muted-foreground">
                    {limit === 0 ? "No limit set" : `${percentage}% utilized`}
                  </p>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Separator />

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Update Slot Limit
          </CardTitle>
          <CardDescription>
            Set or update the daily Priority slot limit for a specific shop and date. This replaces
            any existing time-windowed slot configs for that shop and date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleSave}>
            <div className="flex flex-1 flex-col gap-2">
              <Label>Shop</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Max Priority Slots</Label>
              <Input
                type="number"
                min={1}
                max={999}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="e.g. 10"
                className="w-32"
              />
            </div>
            <Button type="submit" className="gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
