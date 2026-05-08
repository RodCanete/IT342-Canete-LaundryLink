import { DashboardGuard } from "@/features/auth/components/dashboard-guard"
import { MyShopForm } from "@/features/shop-owner/components/my-shop"

export default function ShopOwnerShopPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <MyShopForm />
    </DashboardGuard>
  )
}
