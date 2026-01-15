/**
 * AI-generated investment insights for properties
 */
export interface AIInsights {
  keyAdvantages: string[]
  riskFactors: string[]
  summary: string
}

/**
 * IPFS Metadata structure for tokenized properties
 * This metadata is permanently stored on IPFS and referenced by the smart contract
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
  images: string[] // Array of IPFS URIs (ipfs://...)

  // Tags (e.g., "Luxury", "High Yield", "Beachfront")
  tags: string[]

  // AI Analysis (optional, can be null if generation fails)
  aiInsights: AIInsights | null
}
