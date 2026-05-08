import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { OwnerBookings } from "@/components/shop-owner/owner-bookings"

export default function ShopOwnerBookingsPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <OwnerBookings />
    </DashboardGuard>
  )
}
