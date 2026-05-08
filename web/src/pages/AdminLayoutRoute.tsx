import { Outlet } from "react-router-dom"
import { AdminLayout } from "@/features/admin/components/admin-layout"
import { DashboardGuard } from "@/features/auth/components/dashboard-guard"

export default function AdminLayoutRoute() {
  return (
    <DashboardGuard allowedRole="ADMIN">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </DashboardGuard>
  )
}
