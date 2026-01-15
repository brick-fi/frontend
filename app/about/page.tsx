"use client"

import { HeroSection } from "@/components/about/hero-section"
import { ConceptSection } from "@/components/about/concept-section"
import { ComparisonSection } from "@/components/about/comparison-section"
import { HowItWorksSection } from "@/components/about/flow-section"
import { VisionSection } from "@/components/about/vision-section"

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white overflow-hidden">
            <HeroSection />
            <ConceptSection />
            <ComparisonSection />
            <HowItWorksSection />
            <VisionSection />
        </main>
    )
}
