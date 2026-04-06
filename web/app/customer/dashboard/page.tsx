import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { CustomerDashboard } from "@/components/customer/customer-dashboard"

export default function CustomerDashboardPage() {
  return (
    <DashboardGuard allowedRole="CUSTOMER">
      <CustomerDashboard />
    </DashboardGuard>
  )
}