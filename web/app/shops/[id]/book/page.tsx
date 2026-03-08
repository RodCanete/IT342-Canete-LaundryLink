import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookingFlow } from "@/components/booking/booking-flow"

export default function BookPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingFlow />
      </main>
      <Footer />
    </div>
  )
}
