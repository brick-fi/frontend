"use client"

import { useState } from "react"
import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { PropertyInvestButton } from "./property-invest-button"
import { usePropertyToken } from "@/hooks/usePropertyToken"
import { useAccount } from "wagmi"
import { formatUnits } from "viem"

interface InvestmentPanelProps {
    property: Property
}

export function InvestmentPanel({ property }: InvestmentPanelProps) {
    const [amount, setAmount] = useState<string>("50")
    const { address } = useAccount()
    const propertyAddress = property.id as `0x${string}`

    // Fetch property token data
    const { propertyInfo } = usePropertyToken(propertyAddress)

    // Calculate estimated tokens and monthly income
    // User enters the investment amount (what they want to invest, excluding fee)
    // They send: totalAmount = investment * 1.02 (adding 2% fee)
    // Contract calculates: platformFee = totalAmount * 2 / 102
    // Contract calculates: amountAfterFee = totalAmount - platformFee = investment
    // Contract calculates: tokens = amountAfterFee * 1e18 / TOKEN_PRICE
    const investAmount = parseFloat(amount) || 0
    const totalAmountToSend = investAmount * 1.02  // User pays investment + 2% fee
    const platformFee = investAmount * 0.02  // 2% of investment amount
    const tokenPrice = 50 // $50 per token
    const estimatedTokens = investAmount / tokenPrice  // Tokens based on investment amount (after fee is deducted)

    // Calculate projected monthly income based on token ownership
    let monthlyIncome = 0

    if (propertyInfo && Array.isArray(propertyInfo) && propertyInfo.length >= 5) {
        try {
            const totalValue = Number(formatUnits(propertyInfo[2], 6)) // totalValue from PropertyInfo (index 2)
            const expectedMonthlyIncome = Number(formatUnits(propertyInfo[3], 6)) // expectedMonthlyIncome from PropertyInfo (index 3)

            // Calculate total token supply (totalValue / $50 per token)
            const totalTokenSupply = totalValue / tokenPrice

            // User's share = (user's tokens / total tokens) * monthly income
            if (totalTokenSupply > 0 && !isNaN(expectedMonthlyIncome) && !isNaN(totalValue)) {
                monthlyIncome = (estimatedTokens / totalTokenSupply) * expectedMonthlyIncome
            }
        } catch (error) {
            console.error('Error calculating monthly income:', error)
        }
    }

    return (
        <Card className="border-border/50 shadow-md h-fit sticky top-24">
            <CardHeader>
                <CardTitle>Invest in Real Estate</CardTitle>
                <CardDescription>Mint tokens to receive monthly rental income.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <Label htmlFor="amount">Investment Amount (USDC)</Label>
                        <span className="text-muted-foreground">Min: {property.minInvestment}</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                            id="amount"
                            type="number"
                            min={50}
                            step={50}
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value
                                // Allow empty string for user to clear and type
                                if (value === '') {
                                    setAmount('')
                                    return
                                }
                                // Round to nearest 50
                                const numValue = parseFloat(value)
                                if (!isNaN(numValue)) {
                                    const rounded = Math.round(numValue / 50) * 50
                                    setAmount(rounded.toString())
                                }
                            }}
                            onBlur={(e) => {
                                // Ensure minimum of 50 on blur
                                const numValue = parseFloat(e.target.value)
                                if (isNaN(numValue) || numValue < 50) {
                                    setAmount('50')
                                }
                            }}
                            className="pl-7"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Est. Tokens</span>
                        <span className="font-semibold text-foreground">{estimatedTokens.toFixed(2)} {property.tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Proj. Monthly Income</span>
                        <span className="font-semibold text-brand-gold">
                            ${monthlyIncome.toFixed(2)} / mo
                        </span>
                    </div>
                    <div className="border-t border-border/50 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Platform Fee (2%)</span>
                        <span className="font-medium text-foreground">${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Total to Pay</span>
                        <span className="font-semibold text-foreground">${totalAmountToSend.toFixed(2)}</span>
                    </div>
                </div>


                <PropertyInvestButton
                    propertyTokenAddress={propertyAddress}
                    propertyName={property.title}
                    investAmount={amount}
                />
            </CardContent >

        </Card >
    )
}
