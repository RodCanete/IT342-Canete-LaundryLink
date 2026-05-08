import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { MyShopForm } from "@/components/shop-owner/my-shop"

export default function ShopOwnerShopPage() {
  return (
    <DashboardGuard allowedRole="SHOP_OWNER">
      <MyShopForm />
    </DashboardGuard>
  )
}
