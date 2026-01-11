"use client"

import { useState } from "react"
import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Info } from "lucide-react"

interface InvestmentPanelProps {
    property: Property
}

export function InvestmentPanel({ property }: InvestmentPanelProps) {
    const [amount, setAmount] = useState<string>("50")

    return (
        <Card className="border-border/50 shadow-md h-fit sticky top-24">
            <CardHeader>
                <CardTitle>Invest in Cashflow</CardTitle>
                <CardDescription>Mint tokens to receive monthly rental income.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <Label htmlFor="amount">Investment Amount</Label>
                        <span className="text-muted-foreground">Min: {property.minInvestment}</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-7"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Tokens</span>
                        <span className="font-medium">{(Number(amount) * 0.98).toFixed(2)} CFT</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Proj. Monthly Income</span>
                        <span className="font-medium text-brand-gold">
                            ${(Number(amount) * 0.006).toFixed(2)} / mo
                        </span>
                    </div>
                    <div className="border-t border-border/50 my-2" />
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee</span>
                        <span>2%</span>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-md">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p>Distributions trigger automatically every month via smart contract.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" variant="premium">
                    <Wallet className="mr-2 h-4 w-4" /> Mint Cashflow Tokens
                </Button>
            </CardFooter>
        </Card>
    )
}
