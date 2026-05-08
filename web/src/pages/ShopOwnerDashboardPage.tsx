import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { ShopOwnerDashboard } from "@/features/shop-owner/components/shop-owner-dashboard"

export default function ShopOwnerDashboardPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ShopOwnerDashboard />
    </DashboardGuard>
  )
}
