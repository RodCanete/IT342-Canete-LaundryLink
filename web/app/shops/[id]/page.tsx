import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShopDetailView } from "@/components/shops/shop-detail-view"

type ShopDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { id } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <ShopDetailView shopId={id} />
      </main>
      <Footer />
    </div>
  )
}
