import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { ShopListPage } from "@/features/shops/components/shop-list-page"

export default function ShopsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopListPage />
      </main>
      <Footer />
    </div>
  )
}
