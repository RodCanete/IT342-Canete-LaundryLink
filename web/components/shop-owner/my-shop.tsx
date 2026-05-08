import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ShopOwnerLayout } from "@/components/shop-owner/shop-owner-layout"
import {
  getMyShop,
  updateMyShop,
  type OwnerShopApi,
  type UpdateShopPayload,
} from "@/lib/owner-api"

type FormState = {
  name: string
  address: string
  city: string
  latitude: string
  longitude: string
  operatingHours: string
}

const EMPTY: FormState = {
  name: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  operatingHours: "",
}

function fromShop(shop: OwnerShopApi): FormState {
  return {
    name: shop.name ?? "",
    address: shop.address ?? "",
    city: shop.city ?? "",
    latitude: shop.latitude == null ? "" : String(shop.latitude),
    longitude: shop.longitude == null ? "" : String(shop.longitude),
    operatingHours: shop.operatingHours ?? "",
  }
}

export function MyShopForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMyShop()
      .then((shop) => {
        if (!cancelled) {
          setForm(fromShop(shop))
          setError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: UpdateShopPayload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude.trim() === "" ? null : Number(form.latitude),
        longitude: form.longitude.trim() === "" ? null : Number(form.longitude),
        operatingHours: form.operatingHours.trim() === "" ? null : form.operatingHours.trim(),
      }
      const updated = await updateMyShop(payload)
      setForm(fromShop(updated))
      setSavedAt(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ShopOwnerLayout
      title="My Shop"
      description="Update your shop's profile, location, and operating hours."
    >
      {error && (
        <Card className="mb-6 border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Shop Details</CardTitle>
          <CardDescription>
            These details appear to customers when they browse and book your shop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="e.g. GF22 Laundry Hub"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="shop-address">Address</Label>
                <Textarea
                  id="shop-address"
                  value={form.address}
                  onChange={handleChange("address")}
                  rows={2}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shop-city">City</Label>
                <Input
                  id="shop-city"
                  value={form.city}
                  onChange={handleChange("city")}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shop-hours">Operating Hours</Label>
                <Input
                  id="shop-hours"
                  value={form.operatingHours}
                  onChange={handleChange("operatingHours")}
                  placeholder="e.g. Mon-Sun 7:00 AM - 9:00 PM"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shop-lat">Latitude</Label>
                <Input
                  id="shop-lat"
                  type="number"
                  step="0.00000001"
                  value={form.latitude}
                  onChange={handleChange("latitude")}
                  placeholder="e.g. 10.32762"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="shop-lng">Longitude</Label>
                <Input
                  id="shop-lng"
                  type="number"
                  step="0.00000001"
                  value={form.longitude}
                  onChange={handleChange("longitude")}
                  placeholder="e.g. 123.90490"
                />
              </div>

              <div className="flex items-center justify-end gap-3 sm:col-span-2">
                {savedAt && (
                  <span className="text-xs text-muted-foreground">Saved at {savedAt}</span>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </ShopOwnerLayout>
  )
}
