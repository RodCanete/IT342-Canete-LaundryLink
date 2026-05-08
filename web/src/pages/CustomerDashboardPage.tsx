import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { CustomerDashboard } from "@/features/customer/components/customer-dashboard"

export default function CustomerDashboardPage() {
  return (
    <DashboardGuard allowedRole="CUSTOMER">
      <CustomerDashboard />
    </DashboardGuard>
  )
}
