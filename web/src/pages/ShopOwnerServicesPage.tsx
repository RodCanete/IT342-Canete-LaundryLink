import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { ServicesManagement } from "@/features/shop-owner/components/services-management"

export default function ShopOwnerServicesPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ServicesManagement />
    </DashboardGuard>
  )
}
