"use client"

import { useState } from "react"
import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Info } from "lucide-react"
import { CountUp } from "@/components/ui/count-up"

interface InvestmentPanelProps {
    property: Property
}

export function InvestmentPanel({ property }: InvestmentPanelProps) {
    const [amount, setAmount] = useState<string>("50")

    return (
        <Card className="border-border/50 shadow-md h-fit sticky top-24">
            <CardHeader>
                <CardTitle>Invest in Real Estate</CardTitle>
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
                            min={50}
                            step={50}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-7"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment (Base)</span>
                        <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">$</span>
                            <CountUp value={Number(amount) || 0} decimals={2} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform Fee (2%)</span>
                        <div className="flex items-center text-muted-foreground">
                            <span className="mr-1">+</span>
                            <span>$</span>
                            <CountUp value={(Number(amount) || 0) * 0.02} decimals={2} />
                        </div>
                    </div>
                    <div className="border-t border-border/50 my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Pay</span>
                        <div className="flex items-center text-brand-green">
                            <span className="mr-1">$</span>
                            <CountUp value={(Number(amount) || 0) * 1.02} decimals={2} />
                        </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-dashed border-border/50">
                        <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                            <span>You Receive (100%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">
                                <CountUp value={Number(amount) || 0} decimals={0} suffix={` ${property.tokenSymbol}`} />
                            </span>

                        </div>
                    </div>

                    <div className="flex justify-between text-xs mt-2">
                        <span className="text-muted-foreground">Proj. Monthly Income</span>
                        <span className="text-brand-gold flex items-center gap-1">
                            $
                            <CountUp value={(Number(amount) || 0) * 0.006} decimals={2} />
                            <span>/ mo</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-md">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p>Distributions trigger automatically every month via smart contract.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full relative overflow-hidden group" size="lg" variant="premium">
                    <div className="absolute inset-0 bg-brand-green/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Wallet className="mr-2 h-4 w-4 relative z-10" />
                    <span className="relative z-10">Confirm Investment</span>
                </Button>
            </CardFooter>
        </Card>
    )
}
