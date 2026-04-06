import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BookingFlow } from "@/components/booking/booking-flow"

type BookPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ serviceId?: string }>
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { id } = await params
  const { serviceId } = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <BookingFlow shopId={id} preferredServiceId={serviceId} />
      </main>
      <Footer />
    </div>
  )
}
