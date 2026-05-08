import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { BookingConfirmation } from "@/features/booking/components/booking-confirmation"

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId') ?? undefined
  const payment = searchParams.get('payment') ?? undefined
  const paymentInitFailed = searchParams.get('paymentInitFailed') === '1'

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingConfirmation
          bookingId={bookingId}
          paymentReturnStatus={payment}
          paymentInitFailed={paymentInitFailed}
        />
      </main>
      <Footer />
    </div>
  )
}
