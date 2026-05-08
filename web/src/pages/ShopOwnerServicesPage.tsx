import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { ServicesManagement } from "@/components/shop-owner/services-management"

export default function ShopOwnerServicesPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ServicesManagement />
    </DashboardGuard>
  )
}
