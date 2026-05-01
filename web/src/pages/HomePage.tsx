import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { MarqueeStrip } from "@/components/landing/marquee-strip"
import { ShopListSection } from "@/components/landing/shop-list-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { StatsBand } from "@/components/landing/stats-band"
import { CtaSection } from "@/components/landing/cta-section"

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
