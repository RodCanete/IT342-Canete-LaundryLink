export function StatsBand() {
  return (
    <section className="bg-primary py-14">
      <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-6 px-6 sm:grid-cols-4">
        {[
          { value: "500+", label: "Bookings completed" },
          { value: "5", label: "Partner shops" },
          { value: "4.9★", label: "Average rating" },
          { value: "QR", label: "Instant confirmation" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center" style={{ animation: "count-up 0.6s ease-out both" }}>
            <p className="text-[34px] font-black leading-none tracking-[-0.02em] text-primary-foreground">
              {value}
            </p>
            <p className="mt-1.5 text-[13px] text-primary-foreground/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
