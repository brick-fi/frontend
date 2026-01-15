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
import { Confetti } from '@/components/ui/confetti'

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

    const baseAmount = parseFloat(investAmount)
    if (isNaN(baseAmount) || baseAmount < 50) {
      toast.error('Minimum investment is $50')
      return
    }

    try {
      // Logic Update: Fee is ADDED, not deducted.
      // If user inputs 50, they pay 51.
      // The contract likely expects the TOTAL amount of tokens transfer, 
      // OR the Base amount if it calculates fee itself.
      // PROMPT REQUIREMENT: "Payment request parameter uses totalAmount"
      // So we assume the contract takes the total USDC and splits it.

      const feeAmount = baseAmount * 0.02
      const totalAmount = baseAmount + feeAmount

      // Parse total amount to USDC units (6 decimals)
      // We send the Total Amount to the contract
      const amountInUSDC = parseUnits(totalAmount.toString(), 6)

      // Step 1: Approve USDC (Total Amount)
      toast.info(`Approving $${totalAmount} USDC (Incl. $${feeAmount} Fee)...`)
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
      {isInvestSuccess && <Confetti />}
      <div>
        <label className="text-sm font-medium">Investment Amount (Base)</label>
        <Input
          type="number"
          min="50"
          step="10"
          placeholder="50"
          value={investAmount}
          onChange={(e) => setInvestAmount(e.target.value)}
          disabled={isLoading}
        />
        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
          <span>Platform Fee (2%):</span>
          <span>+ ${(Number(investAmount || 0) * 0.02).toFixed(2)}</span>
        </div>
        <div className="text-sm font-bold mt-1 flex justify-between border-t border-border pt-1">
          <span>Total To Pay:</span>
          <span>${(Number(investAmount || 0) * 1.02).toFixed(2)}</span>
        </div>
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
