import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { MyBookingsView } from "@/features/booking/components/my-bookings-view"

export default function BookingsPage() {
  return (
    <DashboardGuard allowedRole="CUSTOMER">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <MyBookingsView />
        </main>
        <Footer />
      </div>
    </DashboardGuard>
  )
}
