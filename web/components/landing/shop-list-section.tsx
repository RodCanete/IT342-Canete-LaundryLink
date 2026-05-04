"use client"

import { useState } from "react"
import { MapPin, Star, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { partnerShops } from "@/lib/partner-shops"

const shopPhotos = [
  "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
]

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = "/placeholder.jpg"
}

export function ShopListSection() {
  const [activeIdx, setActiveIdx] = useState(0)

  const shop = partnerShops[activeIdx]
  const priorityService = shop.services.find((s) => s.type === "PRIORITY") ?? shop.services[0]
  const standardService = shop.services.find((s) => s.type === "STANDARD") ?? shop.services[0]
  const slotsLeft = priorityService.slotsRemaining ?? 0

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-[1100px] px-6">

        {/* Header */}
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-success">
              <span
                className="h-2 w-2 rounded-full bg-success"
                style={{ animation: "live-pulse 1.4s ease-in-out infinite" }}
              />
              Live Availability
            </div>
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground">
              Partner Laundry Shops
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Trusted shops with real-time slot availability.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/shops">
              View All Shops
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Featured + side list */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">

          {/* Large featured card */}
          <Link
            to={`/shops/${shop.id}`}
            className="relative block overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.005]"
            style={{ height: 280 }}
          >
            <img
              src={shopPhotos[activeIdx % shopPhotos.length]}
              alt={shop.name}
              className="h-full w-full object-cover transition-transform duration-500"
              onError={handleImgError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {/* Info overlay */}
            <div className="absolute bottom-[18px] left-[18px] right-[18px]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[17px] font-bold text-white">{shop.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                    <MapPin className="h-2.5 w-2.5" />
                    {shop.address}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-end gap-1.5">
                    <span className="rounded-[6px] border border-white/20 bg-white/[0.18] px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      PHP {standardService.price} std
                    </span>
                    <span className="rounded-[6px] bg-primary px-2.5 py-1 text-[11px] font-bold text-white">
                      PHP {priorityService.price} priority
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Badge
                      className={
                        slotsLeft === 0 || slotsLeft <= 3
                          ? "bg-destructive text-[10px] text-destructive-foreground"
                          : "bg-success text-[10px] text-success-foreground"
                      }
                    >
                      {slotsLeft === 0 ? "Full today" : `${slotsLeft} slots left`}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot navigation */}
            <div className="absolute left-[18px] top-[14px] flex gap-1.5">
              {partnerShops.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveIdx(i)
                  }}
                  style={{
                    width: i === activeIdx ? 20 : 7,
                    height: 7,
                    borderRadius: 9999,
                    background: "white",
                    opacity: i === activeIdx ? 1 : 0.45,
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.25s",
                    flexShrink: 0,
                  }}
                  aria-label={`Show shop ${i + 1}`}
                />
              ))}
            </div>
          </Link>

          {/* Side list */}
          <div className="flex flex-col gap-2.5">
            {partnerShops.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150 ${
                  i === activeIdx
                    ? "border-primary bg-primary/[0.06]"
                    : "border-border bg-card hover:border-primary/30 hover:bg-secondary/40"
                }`}
              >
                <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[10px]">
                  <img
                    src={shopPhotos[i % shopPhotos.length]}
                    alt={s.name}
                    className="h-full w-full object-cover"
                    onError={handleImgError}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[13px] font-semibold ${
                      i === activeIdx ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.hours}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="h-[10px] w-[10px] fill-warning text-warning" />
                  <span className="text-[11px] font-bold text-foreground">{s.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Browse CTA */}
        <div className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/shops">
              Browse All Shops
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
