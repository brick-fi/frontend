'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { DemoUSDCABI } from '@/lib/abis/DemoUSDC'
import { PropertyTokenABI } from '@/lib/abis/PropertyToken'
import { CONTRACTS, MIN_INVESTMENT } from '@/lib/contracts'

interface PropertyInvestButtonProps {
  propertyTokenAddress: `0x${string}`
  propertyName: string
  investAmount?: string
}

export function PropertyInvestButton({ propertyTokenAddress, propertyName, investAmount: externalAmount }: PropertyInvestButtonProps) {
  const { address } = useAccount()
  const [investAmount, setInvestAmount] = useState(externalAmount || '')

  // Determine if we're in "external amount" mode (used in InvestmentPanel)
  const isExternalMode = externalAmount !== undefined

  // Sync with external amount if provided
  React.useEffect(() => {
    if (externalAmount) {
      setInvestAmount(externalAmount)
    }
  }, [externalAmount])

  // Approve USDC
  const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // Invest
  const { writeContract: invest, data: investHash } = useWriteContract()
  const { isLoading: isInvesting, isSuccess: isInvestSuccess } = useWaitForTransactionReceipt({
    hash: investHash,
  })

  const handleInvest = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    const amount = parseFloat(investAmount)
    if (isNaN(amount) || amount < 50) {
      toast.error('Minimum investment is $50')
      return
    }

    try {
      // Parse amount to USDC units (6 decimals)
      const amountInUSDC = parseUnits(investAmount, 6)

      // Step 1: Approve USDC
      toast.info('Approving USDC...')
      approveUSDC({
        address: CONTRACTS.DEMO_USDC,
        abi: DemoUSDCABI,
        functionName: 'approve',
        args: [propertyTokenAddress, amountInUSDC],
      })
    } catch (error) {
      console.error('Investment error:', error)
      toast.error('Investment failed')
    }
  }

  // When approve succeeds, invest
  React.useEffect(() => {
    if (isApproveSuccess && investHash === undefined) {
      const amountInUSDC = parseUnits(investAmount, 6)

      toast.success('USDC approved! Investing...')
      invest({
        address: propertyTokenAddress,
        abi: PropertyTokenABI,
        functionName: 'invest',
        args: [amountInUSDC],
      })
    }
  }, [isApproveSuccess, investHash])

  // When invest succeeds
  React.useEffect(() => {
    if (isInvestSuccess) {
      toast.success(`Successfully invested $${investAmount} in ${propertyName}!`)
      setInvestAmount('')
    }
  }, [isInvestSuccess])

  const isLoading = isApproving || isInvesting

  // If external amount is provided, only render the button (for use in InvestmentPanel)
  if (isExternalMode) {
    const isDisabled = !address || isLoading || !investAmount || parseFloat(investAmount) < 50

    return (
      <Button
        onClick={handleInvest}
        disabled={isDisabled}
        className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green"
        size="lg"
      >
        {!address ? (
          'Connect Wallet to Invest'
        ) : isLoading ? (
          isApproving ? 'Approving USDC...' : 'Investing...'
        ) : !investAmount || parseFloat(investAmount) < 50 ? (
          'Enter Valid Amount'
        ) : (
          'Confirm Investment'
        )}
      </Button>
    )
  }

  // Standalone version with input field (should not be rendered when used in InvestmentPanel)
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Investment Amount (USDC)</label>
        <Input
          type="number"
          min="50"
          step="10"
          placeholder="50"
          value={investAmount}
          onChange={(e) => setInvestAmount(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Minimum: $50 | Platform fee: 2%
        </p>
      </div>

      <Button
        onClick={handleInvest}
        disabled={!address || isLoading || !investAmount}
        className="w-full"
      >
        {isLoading ? (
          isApproving ? 'Approving USDC...' : 'Investing...'
        ) : (
          'Invest Now'
        )}
      </Button>
    </div>
  )
}
