/**
 * Contract addresses and configuration
 */

export const CONTRACTS = {
  // PropertyFactory contract address (deploy this first)
  PROPERTY_FACTORY: (process.env.NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,

  // DemoUSDC contract address (deploy this first)
  DEMO_USDC: (process.env.NEXT_PUBLIC_DEMO_USDC_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const

export const TOKEN_PRICE = 50 * 1e6 // $50 in USDC (6 decimals)
export const MIN_INVESTMENT = 50 * 1e6 // $50 minimum
export const PLATFORM_FEE_PERCENTAGE = 2 // 2%
