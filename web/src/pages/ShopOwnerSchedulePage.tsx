import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { ScheduleManagement } from "@/features/shop-owner/components/schedule-management"

export default function ShopOwnerSchedulePage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <ScheduleManagement />
    </DashboardGuard>
  )
}
