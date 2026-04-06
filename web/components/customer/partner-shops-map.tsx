"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cebuInstituteOfTechnology, partnerShops, type PartnerShop } from "@/lib/partner-shops"

type GoogleMapsWindow = Window & {
  google?: {
    maps?: any
  }
}

let googleMapsLoader: Promise<void> | null = null

const LIGHT_BLUE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#eef6ff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#34506b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f3f8ff" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c7d8ec" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dfeeff" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d8f1e4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#d4e6fa" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#cde4ff" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#dcecff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#9cc9ff" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2f5f92" }] },
]

const laundryMarkerSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <path d="M22 0C11.4 0 2.8 8.6 2.8 19.2c0 14.3 16.8 33.4 18 35 0.7 0.9 2 0.9 2.7 0 1.2-1.6 18-20.7 18-35C41.2 8.6 32.6 0 22 0z" fill="#0ea5e9"/>
    <rect x="10" y="10" width="24" height="18" rx="3" fill="#ffffff"/>
    <rect x="13" y="13" width="4" height="3" rx="1" fill="#0ea5e9"/>
    <circle cx="22" cy="20" r="5" fill="#0ea5e9" opacity="0.95"/>
    <circle cx="22" cy="20" r="2.8" fill="#ffffff" opacity="0.9"/>
  </svg>
`)

const citHomeMarkerSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <path d="M22 0C11.4 0 2.8 8.6 2.8 19.2c0 14.3 16.8 33.4 18 35 0.7 0.9 2 0.9 2.7 0 1.2-1.6 18-20.7 18-35C41.2 8.6 32.6 0 22 0z" fill="#ef4444"/>
    <circle cx="22" cy="18" r="6" fill="#ffffff" opacity="0.95"/>
    <circle cx="22" cy="18" r="3" fill="#ef4444"/>
  </svg>
`)

function createLaundryMarkerIcon(maps: any) {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${laundryMarkerSvg}`,
    scaledSize: new maps.Size(38, 48),
    anchor: new maps.Point(19, 48),
    labelOrigin: new maps.Point(19, 16),
  }
}

function createCitHomeMarkerIcon(maps: any) {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${citHomeMarkerSvg}`,
    scaledSize: new maps.Size(38, 48),
    anchor: new maps.Point(19, 48),
  }
}

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"))
  }

  const browserWindow = window as GoogleMapsWindow

  if (browserWindow.google?.maps) {
    return Promise.resolve()
  }

  if (googleMapsLoader) {
    return googleMapsLoader
  }

  googleMapsLoader = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-laundrylink-google-maps]")

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.dataset.laundrylinkGoogleMaps = "true"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Maps"))
    document.head.appendChild(script)
  })

  return googleMapsLoader
}

type PartnerShopsMapProps = {
  activeShop: PartnerShop | undefined
  onSelectShop: (shopId: number) => void
}

export function PartnerShopsMap({ activeShop, onSelectShop }: PartnerShopsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setStatus("error")
      setErrorMessage("Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to web/.env.local to display the map.")
      return
    }

    let cancelled = false

    setStatus("loading")

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapContainerRef.current) {
          return
        }

        const maps = (window as GoogleMapsWindow).google?.maps

        if (!maps) {
          throw new Error("Google Maps is unavailable")
        }

        const map = new maps.Map(mapContainerRef.current, {
          center: cebuInstituteOfTechnology.location,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: LIGHT_BLUE_MAP_STYLE,
        })

        mapRef.current = map
        infoWindowRef.current = new maps.InfoWindow()
        const laundryIcon = createLaundryMarkerIcon(maps)
        const citHomeIcon = createCitHomeMarkerIcon(maps)

        const citMarker = new maps.Marker({
          map,
          position: cebuInstituteOfTechnology.location,
          title: cebuInstituteOfTechnology.name,
          icon: citHomeIcon,
        })

        citMarker.addListener("click", () => {
          infoWindowRef.current?.setContent(
            `<div style="min-width: 180px;"><strong>${cebuInstituteOfTechnology.name}</strong><br />${cebuInstituteOfTechnology.address}</div>`
          )
          infoWindowRef.current?.open({ map, anchor: citMarker })
        })

        markersRef.current = partnerShops.map((shop) => {
          const marker = new maps.Marker({
            map,
            position: shop.location,
            title: shop.name,
            icon: laundryIcon,
            label: {
              text: String(shop.id),
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: "700",
            },
          })

          marker.addListener("click", () => {
            onSelectShop(shop.id)
            map.panTo(shop.location)
            map.setZoom(16)
            infoWindowRef.current?.setContent(buildInfoWindowContent(shop))
            infoWindowRef.current?.open({ map, anchor: marker })
          })

          return marker
        })

        setStatus("ready")
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Failed to load Google Maps")
      })

    return () => {
      cancelled = true

      markersRef.current.forEach((marker) => marker.setMap?.(null))
      markersRef.current = []
      infoWindowRef.current?.close?.()
    }
  }, [onSelectShop])

  useEffect(() => {
    if (!mapRef.current || !activeShop) {
      return
    }

    mapRef.current.panTo(activeShop.location)
  }, [activeShop])

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
          <div className="relative h-[420px] w-full">
            <div ref={mapContainerRef} className="absolute inset-0" />
            {status !== "ready" && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/85 px-4 text-center backdrop-blur-sm">
                <div className="max-w-sm space-y-2">
                  <MapPin className="mx-auto h-10 w-10 text-primary/50" />
                  <p className="text-sm font-medium text-foreground">
                    {status === "loading" ? "Loading Google Maps..." : "Map unavailable"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {errorMessage || "The partner shop markers will appear here once the Google Maps API key is configured."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Available Shops Near You</h2>
          <Badge variant="secondary" className="border-none bg-secondary/80 text-foreground">
            {partnerShops.length} shops
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partnerShops.map((shop) => {
            const isActive = activeShop?.id === shop.id
            const standardService = shop.services.find((s) => s.type === "STANDARD")
            const priorityService = shop.services.find((s) => s.type === "PRIORITY")
            const standardPrice = standardService?.price ?? 0
            const priorityPrice = priorityService?.price ?? 0
            const prioritySlots = priorityService?.slotsRemaining ?? 0

            return (
              <div
                key={shop.id}
                className={`flex flex-col rounded-2xl border transition ${
                  isActive ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground">{shop.name}</h3>
                    <Badge className="border-none bg-warning/10 text-warning">⭐ {shop.rating}</Badge>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{shop.address}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {shop.hours}
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Standard</span>
                        <span className="font-bold text-foreground">PHP {standardPrice}</span>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Priority</span>
                        <span className="font-bold text-foreground">PHP {priorityPrice}</span>
                      </div>
                    </div>
                  </div>

                  <p
                    className={`text-sm font-medium ${
                      prioritySlots > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {prioritySlots > 0
                      ? `${prioritySlots} priority slots available`
                      : "No priority slots available"}
                  </p>
                </div>

                <Button
                  asChild
                  className="m-4 mt-auto"
                  onClick={() => onSelectShop(shop.id)}
                >
                  <Link href={`/shops/${shop.id}`}>View Shop & Book</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function buildInfoWindowContent(shop: PartnerShop) {
  const services = shop.services
    .slice(0, 2)
    .map((service) => `<li>${service.name} - PHP ${service.price}</li>`)
    .join("")

  return `
    <div style="min-width:220px;max-width:260px;font-family:Arial,sans-serif;line-height:1.5;">
      <strong>${shop.name}</strong><br />
      <span>${shop.address}</span><br />
      <span>Rating: ${shop.rating}</span>
      <ul style="padding-left:18px;margin:10px 0 0;">${services}</ul>
    </div>
  `
}