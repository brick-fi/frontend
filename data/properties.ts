import { AIInsights } from "@/types/metadata"

export interface Property {
    id: string
    title: string
    location: string
    imageUrl: string
    images?: string[]
    projectedYield: string
    minInvestment: string
    totalValue: string
    funded: number
    investorCount: number
    description: string
    tags: string[]
    tokenSymbol: string
    aiInsights?: AIInsights | null // AI-generated insights from metadata
}

export const PROPERTIES: Property[] = []
