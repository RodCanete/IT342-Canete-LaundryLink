import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopDetailView } from "@/components/shops/shop-detail-view"

export default function ShopDetailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopDetailView />
      </main>
      <Footer />
    </div>
  )
}
