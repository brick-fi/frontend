"use client"

import { notFound, useParams } from "next/navigation"
import { PropertyHero } from "@/components/property/property-hero"
import { PropertyStats } from "@/components/property/property-stats"
import { InvestmentPanel } from "@/components/property/investment-panel"
import { AiAnalysis } from "@/components/property/ai-analysis"
import { WorldModelSection } from "@/components/property/world-model-section"
import { Separator } from "@/components/ui/separator"
import { useProperties } from "@/context/property-context"

export default function PropertyPage() {
    const params = useParams()
    const id = params.id as string
    const { properties, isLoading } = useProperties()

    // Find property by contract address (id)
    const property = properties.find(p => p.id === id)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading property details...</p>
                </div>
            </div>
        )
    }

    if (!property) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PropertyHero property={property} />

            <div className="w-full px-4 md:px-12 lg:px-20 2xl:px-32 py-12">
                <div className="flex flex-col lg:flex-row gap-12 2xl:gap-24">
                    {/* Left Column: Analysis & Details */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{property.title}</h1>
                            <p className="text-muted-foreground text-lg">{property.location}</p>
                        </div>

                        <PropertyStats property={property} />

                        <Separator className="my-8" />

                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-4">About this Opportunity</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        <AiAnalysis property={property} />

                        <WorldModelSection property={property} />
                    </div>

                    {/* Right Column: Investment Panel */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <InvestmentPanel property={property} />
                    </div>
                </div>
            </div>
        </div>
    )
}
