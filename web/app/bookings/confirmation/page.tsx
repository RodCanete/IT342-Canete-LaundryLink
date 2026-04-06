import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"

type ConfirmationPageProps = {
  searchParams: Promise<{ bookingId?: string }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { bookingId } = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingConfirmation bookingId={bookingId} />
      </main>
      <Footer />
    </div>
  )
}
