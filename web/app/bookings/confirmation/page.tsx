import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingConfirmation />
      </main>
      <Footer />
    </div>
  )
}
