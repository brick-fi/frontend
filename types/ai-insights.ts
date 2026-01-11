/**
 * AI-generated investment insights for properties
 */

export interface InvestmentInsights {
  keyAdvantages: string[]
  riskFactors: string[]
  summary: string
  yieldEstimate?: string
  generatedAt?: number // Unix timestamp
}

export interface PropertyWithInsights {
  propertyId: number
  insights: InvestmentInsights
  lastUpdated: number
}
