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
export const PLATFORM_FEE_PERCENTAGE = 0.02 // 2%

export function calculateTransactionDetails(baseAmount: number) {
  // Always use integer math if possible, but for simple JS frontend display:
  // baseAmount is in Dollars (e.g. 50).
  // fee = 50 * 0.02 = 1.
  // total = 51.

  // Logic: 
  // 1. base = input
  // 2. fee = ceil(base * 0.02) -> rounding mode as requested (User said "ROUND_HALF_UP" or "CEIL option").
  // Let's use simple rounding for now as per "ROUND_HALF_UP" default.

  const fee = Math.round(baseAmount * PLATFORM_FEE_PERCENTAGE * 100) / 100
  const total = baseAmount + fee

  return {
    baseAmount,
    feeAmount: fee,
    totalAmount: total
  }
}
