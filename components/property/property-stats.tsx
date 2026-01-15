"use client"

import { Property } from "@/data/properties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react"
import { usePropertyToken } from "@/hooks/usePropertyToken"

interface PropertyStatsProps {
    property: Property
}

export function PropertyStats({ property }: PropertyStatsProps) {
    const propertyAddress = property.id as `0x${string}`
    const { investorCount } = usePropertyToken(propertyAddress)

    const investorCountDisplay = investorCount !== undefined ? Number(investorCount) : 0

    // Format projected yield to 2 decimal places
    const formatYield = (yieldStr: string): string => {
        // Handle range format like "5.8% - 6.8%"
        if (yieldStr.includes('-')) {
            const [min, max] = yieldStr.split('-').map(s => s.trim().replace('%', ''))
            const minNum = parseFloat(min)
            const maxNum = parseFloat(max)
            if (!isNaN(minNum) && !isNaN(maxNum)) {
                return `${minNum.toFixed(2)}% - ${maxNum.toFixed(2)}%`
            }
        }
        // Handle single value format like "0.1%"
        const numStr = yieldStr.replace('%', '').trim()
        const num = parseFloat(numStr)
        if (!isNaN(num)) {
            return `${num.toFixed(2)}%`
        }
        return yieldStr
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Proj. Yield</CardTitle>
                    <TrendingUp className="h-4 w-4 text-brand-gold" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatYield(property.projectedYield)}</div>
                    <p className="text-xs text-muted-foreground">Annualized Return</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Min. Investment</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{property.minInvestment}</div>
                    <p className="text-xs text-muted-foreground">Low Barrier Entry</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Asset Value</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{property.totalValue}</div>
                    <p className="text-xs text-muted-foreground">Total Token Supply</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{investorCountDisplay}</div>
                    <p className="text-xs text-muted-foreground">Currently Participating</p>
                </CardContent>
            </Card>
        </div>
    )
}
