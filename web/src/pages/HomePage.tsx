import { Navbar } from "@/shared/components/navbar"
import { Footer } from "@/shared/components/footer"
import { HeroSection } from "@/features/landing/components/hero-section"
import { MarqueeStrip } from "@/features/landing/components/marquee-strip"
import { ShopListSection } from "@/features/landing/components/shop-list-section"
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section"
import { StatsBand } from "@/features/landing/components/stats-band"
import { CtaSection } from "@/features/landing/components/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MarqueeStrip />
        <ShopListSection />
        <HowItWorksSection />
        <StatsBand />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
