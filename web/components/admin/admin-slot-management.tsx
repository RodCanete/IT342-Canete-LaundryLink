
import { useState } from "react"
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

const shops = [
  { id: "1", name: "FreshSpin Laundry Hub", currentLimit: 10, usedToday: 7 },
  { id: "2", name: "CleanWave Express", currentLimit: 8, usedToday: 3 },
  { id: "3", name: "Sparkle & Fold", currentLimit: 6, usedToday: 5 },
  { id: "4", name: "QuickDry Laundromat", currentLimit: 12, usedToday: 4 },
  { id: "5", name: "BrightWash Laundry", currentLimit: 10, usedToday: 8 },
]

export function AdminSlotManagement() {
  const [selectedShop, setSelectedShop] = useState<string | undefined>(undefined)
  const [slotDate, setSlotDate] = useState("")
  const [newLimit, setNewLimit] = useState("")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Slot Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure daily Priority slot limits per shop and monitor utilization.
        </p>
      </div>

      {/* Current Slot Utilization */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => {
          const percentage = Math.round((shop.usedToday / shop.currentLimit) * 100)
          const isNearFull = percentage >= 80
          return (
            <Card key={shop.id} className="border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground">{shop.name}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Priority Slots Used Today</span>
                  <Badge
                    variant="secondary"
                    className={`border-none ${
                      isNearFull ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                    }`}
                  >
                    {shop.usedToday} / {shop.currentLimit}
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
                <p className="mt-1.5 text-right text-xs text-muted-foreground">{percentage}% utilized</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Separator />

      {/* Update Slot Limit */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Update Slot Limit
          </CardTitle>
          <CardDescription>
            Set or update the daily Priority slot limit for a specific shop and date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
                max={50}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="e.g. 10"
                className="w-32"
              />
            </div>
            <Button type="button" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
