import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { ShopOwnerDashboard } from "@/components/shop-owner/shop-owner-dashboard"

export default function ShopOwnerDashboardPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ShopOwnerDashboard />
    </DashboardGuard>
  )
}