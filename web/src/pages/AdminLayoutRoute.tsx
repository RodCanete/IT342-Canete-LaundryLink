import { Outlet } from "react-router-dom"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardGuard } from "@/components/auth/dashboard-guard"

export default function AdminLayoutRoute() {
  return (
    <DashboardGuard allowedRole="ADMIN">
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </DashboardGuard>
  )
}
