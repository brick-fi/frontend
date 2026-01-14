'use client'

import { useState } from 'react'
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
}

export function PropertyInvestButton({ propertyTokenAddress, propertyName }: PropertyInvestButtonProps) {
  const { address } = useAccount()
  const [investAmount, setInvestAmount] = useState('')

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
  if (isApproveSuccess && investHash === undefined) {
    // Re-calculate total for the invest call
    // Note: In a real app we should store the 'pendingTotal' in state to ensure it matches
    const base = parseFloat(investAmount)
    const total = base * 1.02
    const amountInUSDC = parseUnits(total.toString(), 6)

    toast.success('USDC approved! Investing...')
    invest({
      address: propertyTokenAddress,
      abi: PropertyTokenABI,
      functionName: 'invest',
      args: [amountInUSDC],
    })
  }

  // When invest succeeds
  if (isInvestSuccess) {
    toast.success(`Successfully invested! You will receive full tokens.`)
    // Reset after delay
    setTimeout(() => setInvestAmount(''), 2000)
  }

  const isLoading = isApproving || isInvesting

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
