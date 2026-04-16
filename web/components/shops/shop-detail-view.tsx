
import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { MapPin, Clock, Star, ArrowLeft, Zap, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api"
import { getShop, getSlots, listShopServices, toIsoDateOnly, type ServiceApi, type ShopApi } from "@/lib/booking-api"

type ShopDetailViewProps = {
  shopId: string
}

type ServiceWithSlots = ServiceApi & {
  slotsRemaining?: number
  maxSlots?: number
}

export function ShopDetailView({ shopId }: ShopDetailViewProps) {
  const [shop, setShop] = useState<ShopApi | null>(null)
  const [services, setServices] = useState<ServiceWithSlots[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadShopDetails() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [shopData, serviceData] = await Promise.all([getShop(shopId), listShopServices(shopId)])
        const today = toIsoDateOnly(new Date())

        const servicesWithSlots = await Promise.all(
          serviceData.map(async (service) => {
            if (service.serviceType !== "PRIORITY") {
              return service
            }

            const slots = await getSlots({
              shopId,
              serviceId: service.id,
              date: today,
            })

            return {
              ...service,
              slotsRemaining: slots.reduce((total, slot) => total + slot.available, 0),
              maxSlots: slots.reduce((total, slot) => total + slot.maxSlots, 0),
            }
          })
        )

        if (!active) {
          return
        }

        setShop(shopData)
        setServices(servicesWithSlots)
      } catch (error) {
        if (!active) {
          return
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to load shop details"
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadShopDetails()

    return () => {
      active = false
    }
  }, [shopId])

  const shopDescription = useMemo(() => {
    if (!shop) {
      return ""
    }

    return `${shop.name} in ${shop.city} is available for booking with live service availability from the database.`
  }, [shop])

  if (isLoading) {
    return <section className="bg-background py-8 lg:py-12"><div className="mx-auto max-w-4xl px-4 lg:px-8 text-sm text-muted-foreground">Loading shop details...</div></section>
  }

  if (!shop || errorMessage) {
    return (
      <section className="bg-background py-8 lg:py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage || "Shop not found"}
          </p>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return null
  }

  return (
    <section className="bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <Link
          href="/customer/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {shop.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {shop.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {shop.operatingHours || "Hours not set"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-sm font-semibold text-foreground">4.8</span>
              <span className="text-xs text-muted-foreground">Nearby partner</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {shopDescription}
          </p>
        </div>

        <Separator className="mb-8" />

        <div>
          <h2 className="mb-6 text-xl font-bold text-foreground">Available Services</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((service) => (
              <Card
                key={`${shop.id}-${service.serviceType}-${service.name}-${service.id}`}
                className={`relative overflow-hidden border-border transition-all hover:shadow-md ${
                  service.serviceType === "PRIORITY" ? "ring-2 ring-primary/20" : ""
                }`}
              >
                {service.serviceType === "PRIORITY" && (
                  <div className="absolute right-0 top-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                      <Zap className="mr-1 h-3 w-3" />
                      Priority
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Live service data from the partner shop database.</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{'PHP '}{service.price}</span>
                    <span className="text-sm text-muted-foreground">/ load</span>
                  </div>

                  <ul className="flex flex-col gap-1.5">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Service type: {service.serviceType === "PRIORITY" ? "Priority" : "Standard"}
                    </li>
                  </ul>

                  {service.serviceType === "PRIORITY" && service.slotsRemaining !== undefined && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {service.slotsRemaining} of {service.maxSlots} slots remaining today
                      </span>
                    </div>
                  )}

                  {service.serviceType === "PRIORITY" && (service.slotsRemaining ?? 0) <= 0 ? (
                    <Button className="w-full" disabled>
                      No Slots Available
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link
                        href={`/shops/${shop.id}/book?serviceId=${service.id}&type=${service.serviceType}`}
                      >
                        {service.serviceType === "PRIORITY" ? "Book Priority Slot" : "Book Standard"}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
