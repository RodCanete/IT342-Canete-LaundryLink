import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { OwnerBookings } from "@/features/shop-owner/components/owner-bookings"

export default function ShopOwnerBookingsPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <OwnerBookings />
    </DashboardGuard>
  )
}
