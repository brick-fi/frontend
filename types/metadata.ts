/**
 * AI-generated investment insights for properties
 */
export interface AIInsights {
  keyAdvantages: string[]
  riskFactors: string[]
  summary: string
}

export interface PropertyWorldModel {
  provider: 'world_labs'
  worldId: string | null
  worldMarbleUrl: string | null
  thumbnailUrl: string | null
  panoUrl: string | null
  spzUrls: Record<string, string>
  colliderMeshUrl: string | null
}

/**
 * Metadata structure for tokenized properties.
 * This metadata is stored at the URI referenced by the smart contract.
 */
export interface PropertyMetadata {
  // Basic Info
  name: string
  description: string
  location: string

  // Financial Data (in USD, 6 decimals matching USDC)
  totalValue: number
  expectedMonthlyIncome: number

  // Media
  images: string[]
  worldModel?: PropertyWorldModel | null

  // Tags (e.g., "Luxury", "High Yield", "Beachfront")
  tags: string[]

  // AI Analysis (optional, can be null if generation fails)
  aiInsights: AIInsights | null
}
