import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { ScheduleManagement } from "@/components/shop-owner/schedule-management"

export default function ShopOwnerSchedulePage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ScheduleManagement />
    </DashboardGuard>
  )
}
