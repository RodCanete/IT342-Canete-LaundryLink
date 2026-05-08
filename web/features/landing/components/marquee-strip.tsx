export function MarqueeStrip() {
  const items = [
    "GF22 Laundry Hub",
    "Wash 'n Spin Laundromat",
    "Isa's Laundry",
    "Wash Me Clean Laundry",
    "B&J Laundry",
    "500+ Bookings",
    "4.9★ Rating",
    "QR Code Drop-off",
    "PayMongo Secure",
  ]
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden bg-primary py-2.5">
      <div
        className="flex w-max"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 whitespace-nowrap px-7 text-xs font-semibold text-primary-foreground/90"
          >
            <span className="h-1 w-1 rounded-full bg-primary-foreground/50" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
