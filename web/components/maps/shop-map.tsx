import { useState, useMemo, useCallback } from "react"
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api"
import { Link } from "react-router-dom"
import { MapPin, Star, Clock } from "lucide-react"
import { partnerShops, cebuInstituteOfTechnology, type PartnerShop } from "@/lib/partner-shops"

const containerStyle = { width: "100%", height: "100%" }

export function ShopMap() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  })

  const center = useMemo(() => cebuInstituteOfTechnology.location, [])
  const [selectedShop, setSelectedShop] = useState<PartnerShop | null>(null)
  const handleMapClick = useCallback(() => setSelectedShop(null), [])

  if (!apiKey) {
    return <Placeholder label="Add VITE_GOOGLE_MAPS_API_KEY to .env.local to enable the map." />
  }

  if (loadError) {
    return <Placeholder label="Failed to load Google Maps. Check your API key in Google Cloud Console." />
  }

  if (!isLoaded) {
    return <Placeholder label="Loading map…" spinner />
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleMapClick}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      {partnerShops.map((shop) => (
        <MarkerF
          key={shop.id}
          position={shop.location}
          title={shop.name}
          onClick={() => setSelectedShop(shop)}
        />
      ))}

      {selectedShop && (
        <InfoWindowF
          position={selectedShop.location}
          onCloseClick={() => setSelectedShop(null)}
        >
          <div className="max-w-[180px] space-y-1 p-1">
            <p className="text-sm font-semibold text-gray-900">{selectedShop.name}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {selectedShop.address}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {selectedShop.hours}
              </span>
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {selectedShop.rating}
              </span>
            </div>
            <Link
              to={`/shops/${selectedShop.id}`}
              className="mt-1 block rounded bg-blue-600 px-2 py-1 text-center text-xs font-medium text-white hover:bg-blue-700"
            >
              Book Now →
            </Link>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  )
}

function Placeholder({ label, spinner }: { label: string; spinner?: boolean }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        {spinner ? (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        ) : (
          <MapPin className="h-10 w-10 text-primary/40" />
        )}
        <p className="max-w-xs text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
