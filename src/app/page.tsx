import { Hero } from '@/components/landing/Hero'
import { StatsBar } from '@/components/landing/StatsBar'
import { Marquee } from '@/components/landing/Marquee'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { BriquesGrid } from '@/components/landing/BriquesGrid'
import { CostOfInaction } from '@/components/landing/CostOfInaction'
import { SocialProof } from '@/components/landing/SocialProof'
import { WallOfWins } from '@/components/landing/WallOfWins'
import { AITransparency } from '@/components/landing/AITransparency'
import { Commitments } from '@/components/landing/Commitments'
import { AvocatComparison } from '@/components/landing/AvocatComparison'
import { ReportPreview } from '@/components/landing/ReportPreview'
import { TrustLogos } from '@/components/landing/TrustLogos'
import { Pricing } from '@/components/landing/Pricing'
import { HomeFAQ } from '@/components/landing/HomeFAQ'
import { FinalCTA } from '@/components/landing/FinalCTA'

export default function HomePage() {
  return (
    <>
      {/* ATTENTION */}
      <Hero />
      <StatsBar />
      <Marquee />

      {/* INTÉRÊT */}
      <HowItWorks />
      <BriquesGrid />

      {/* DÉSIR — Urgence */}
      <CostOfInaction />
      <SocialProof />
      <WallOfWins />

      {/* CONFIANCE */}
      <AITransparency />
      <Commitments />

      {/* DIFFÉRENCIATION */}
      <AvocatComparison />
      <ReportPreview />
      <TrustLogos />

      {/* ACTION */}
      <Pricing />
      <HomeFAQ />
      <FinalCTA />
    </>
  )
}
