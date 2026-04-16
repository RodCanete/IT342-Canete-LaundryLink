import { Outlet } from "react-router-dom"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
