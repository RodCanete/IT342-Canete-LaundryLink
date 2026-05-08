import { useParams, useSearchParams } from "react-router-dom"
import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { BookingFlow } from "@/features/booking/components/booking-flow"

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const serviceId = searchParams.get('serviceId') ?? undefined

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingFlow shopId={id!} preferredServiceId={serviceId} />
      </main>
      <Footer />
    </div>
  )
}
