import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopDetailView } from "@/components/shops/shop-detail-view"

export default function ShopDetailPage({ params }: { params: { id: string } }) {
  const shopId = Number.parseInt(params.id, 10)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopDetailView shopId={Number.isNaN(shopId) ? 1 : shopId} />
      </main>
      <Footer />
    </div>
  )
}
