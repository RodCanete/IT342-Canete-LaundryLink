import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MyBookingsView } from "@/components/booking/my-bookings-view"

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
