import { useParams } from "react-router-dom"
import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { ShopDetailView } from "@/features/shops/components/shop-detail-view"

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopDetailView shopId={id!} />
      </main>
      <Footer />
    </div>
  )
}
