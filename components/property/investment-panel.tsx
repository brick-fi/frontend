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
    const { propertyInfo, getUserProjectedMonthlyIncome } = usePropertyToken(propertyAddress)
    const { data: projectedIncome } = getUserProjectedMonthlyIncome(address)

    // Calculate estimated tokens and monthly income
    const investAmount = parseFloat(amount) || 0
    const platformFee = investAmount * 0.02
    const amountAfterFee = investAmount - platformFee
    const tokenPrice = 50 // $50 per token
    const estimatedTokens = amountAfterFee / tokenPrice

    // Calculate projected monthly income based on investment
    let monthlyIncome = 0
    if (propertyInfo && Array.isArray(propertyInfo)) {
        const expectedMonthlyIncome = Number(formatUnits(propertyInfo[4], 6)) // expectedMonthlyIncome from PropertyInfo
        const totalValue = Number(formatUnits(propertyInfo[3], 6)) // totalValue from PropertyInfo
        if (totalValue > 0) {
            monthlyIncome = (investAmount / totalValue) * expectedMonthlyIncome
        }
    }

    // Show user's current monthly income if exists
    const hasCurrentIncome: boolean = !!(address && projectedIncome && typeof projectedIncome === 'bigint' && Number(projectedIncome) > 0)
    const currentMonthlyIncome = hasCurrentIncome && typeof projectedIncome === 'bigint' ? Number(formatUnits(projectedIncome, 6)) : 0

    return (
        <Card className="border-border/50 shadow-md h-fit sticky top-24">
            <CardHeader>
                <CardTitle>Invest in Cashflow</CardTitle>
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
                            step={10}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-7"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Tokens</span>
                        <span className="font-medium">{estimatedTokens.toFixed(2)} {property.tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Proj. Monthly Income</span>
                        <span className="font-medium text-brand-gold">
                            ${monthlyIncome.toFixed(2)} / mo
                        </span>
                    </div>
                    <div className="border-t border-border/50 my-2" />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span>${platformFee.toFixed(2)} (2%)</span>
                    </div>
                </div>

                {hasCurrentIncome && (
                    <div className="rounded-lg bg-brand-gold/10 border border-brand-gold/20 p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Your Current Monthly Income</span>
                            <span className="font-medium text-brand-gold">
                                ${currentMonthlyIncome.toFixed(2)} / mo
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-md">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p>Distributions trigger automatically every month via smart contract.</p>
                </div>

                <PropertyInvestButton
                    propertyTokenAddress={propertyAddress}
                    propertyName={property.title}
                    investAmount={amount}
                />
            </CardContent>
        </Card>
    )
}
