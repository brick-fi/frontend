import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { PropertyTokenABI } from '@/lib/abis/PropertyToken'
import { Address } from 'viem'

export function usePropertyToken(propertyTokenAddress?: Address) {
  // Read: Property info
  const { data: propertyInfo } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'property',
  })

  // Read: Max supply
  const { data: maxSupply } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'maxSupply',
  })

  // Read: Get sold tokens
  const { data: soldTokens } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'getSoldTokens',
  })

  // Read: Get available tokens
  const { data: availableTokens } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'getAvailableTokens',
  })

  // Read: Get funding percentage
  const { data: fundingPercentage } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'getFundingPercentage',
  })

  // Read: Get investor count
  const { data: investorCount } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'getInvestorCount',
  })

  // Read: Get user's token balance
  const getUserBalance = (userAddress?: Address) => {
    return useReadContract({
      address: propertyTokenAddress,
      abi: PropertyTokenABI,
      functionName: 'balanceOf',
      args: userAddress ? [userAddress] : undefined,
    })
  }

  // Read: Get user's investment amount
  const getUserInvestmentAmount = (userAddress?: Address) => {
    return useReadContract({
      address: propertyTokenAddress,
      abi: PropertyTokenABI,
      functionName: 'getUserInvestmentAmount',
      args: userAddress ? [userAddress] : undefined,
    })
  }

  // Read: Get user's projected monthly income
  const getUserProjectedMonthlyIncome = (userAddress?: Address) => {
    return useReadContract({
      address: propertyTokenAddress,
      abi: PropertyTokenABI,
      functionName: 'getUserProjectedMonthlyIncome',
      args: userAddress ? [userAddress] : undefined,
    })
  }

  // Read: Get distribution count
  const { data: distributionCount } = useReadContract({
    address: propertyTokenAddress,
    abi: PropertyTokenABI,
    functionName: 'getDistributionCount',
  })

  // Read: Get pending revenue for user
  const getPendingRevenue = (userAddress?: Address, distributionId?: number) => {
    return useReadContract({
      address: propertyTokenAddress,
      abi: PropertyTokenABI,
      functionName: 'getPendingRevenue',
      args: userAddress && distributionId !== undefined ? [userAddress, BigInt(distributionId)] : undefined,
    })
  }

  // Write: Invest
  const {
    writeContract: invest,
    data: investHash,
    isPending: isInvesting,
    isError: isInvestError,
    error: investError,
  } = useWriteContract()

  // Wait for invest transaction
  const {
    isLoading: isWaitingForInvest,
    isSuccess: isInvestSuccess
  } = useWaitForTransactionReceipt({
    hash: investHash,
  })

  // Write: Claim revenue
  const {
    writeContract: claimRevenue,
    data: claimHash,
    isPending: isClaiming,
    isError: isClaimError,
    error: claimError,
  } = useWriteContract()

  // Wait for claim transaction
  const {
    isLoading: isWaitingForClaim,
    isSuccess: isClaimSuccess
  } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  return {
    // Property info
    propertyInfo,
    maxSupply,
    soldTokens,
    availableTokens,
    fundingPercentage,
    investorCount,
    distributionCount,

    // User-specific reads
    getUserBalance,
    getUserInvestmentAmount,
    getUserProjectedMonthlyIncome,
    getPendingRevenue,

    // Invest
    invest,
    isInvesting,
    isWaitingForInvest,
    isInvestSuccess,
    isInvestError,
    investError,

    // Claim
    claimRevenue,
    isClaiming,
    isWaitingForClaim,
    isClaimSuccess,
    isClaimError,
    claimError,
  }
}
