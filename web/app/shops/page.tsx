import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopListPage } from "@/components/shops/shop-list-page"

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
