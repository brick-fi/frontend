"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProperties } from "@/context/property-context"
import { PropertyCard } from "@/components/property/property-card"
import { useAccount } from "wagmi"
import { usePropertyToken } from "@/hooks/usePropertyToken"
import { formatUnits } from "viem"
import Image from "next/image"
import Link from "next/link"
import { Property } from "@/data/properties"

// Individual property investment component
function PropertyInvestment({ property, address }: { property: Property, address: `0x${string}` }) {
    const propertyAddress = property.id as `0x${string}`
    const { getUserBalance, getUserInvestmentAmount, getUserProjectedMonthlyIncome } = usePropertyToken(propertyAddress)

    const { data: balance } = getUserBalance(address)
    const { data: investmentAmount } = getUserInvestmentAmount(address)
    const { data: monthlyIncome } = getUserProjectedMonthlyIncome(address)

    const balanceNum = balance ? Number(balance) : 0
    const investmentAmountNum = investmentAmount ? Number(formatUnits(investmentAmount, 6)) : 0
    const monthlyIncomeNum = monthlyIncome ? Number(formatUnits(monthlyIncome, 6)) : 0

    // Only render if user has invested
    if (balanceNum === 0) return null

    return (
        <Link href={`/property/${property.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md bg-muted overflow-hidden relative">
                            <Image
                                src={property.imageUrl}
                                alt={property.title}
                                fill
                                className="object-cover"
                                unoptimized={property.imageUrl.includes('gateway.pinata.cloud')}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold">{property.title}</h3>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(balanceNum / 1e18).toFixed(2)} tokens
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold text-lg">
                            ${investmentAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-brand-green mt-1">
                            +${monthlyIncomeNum.toFixed(2)} / mo
                        </div>
                        <Badge variant="secondary" className="mt-2">Active</Badge>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

// Stats aggregator component
function PortfolioStats({ properties, address }: { properties: Property[], address: `0x${string}` }) {
    // Aggregate data from all properties
    let totalInvested = 0
    let totalMonthlyIncome = 0
    let propertyCount = 0

    const propertyData = properties.map(property => {
        const propertyAddress = property.id as `0x${string}`
        const { getUserBalance, getUserInvestmentAmount, getUserProjectedMonthlyIncome } = usePropertyToken(propertyAddress)

        const { data: balance } = getUserBalance(address)
        const { data: investmentAmount } = getUserInvestmentAmount(address)
        const { data: monthlyIncome } = getUserProjectedMonthlyIncome(address)

        const balanceNum = balance ? Number(balance) : 0
        const investmentAmountNum = investmentAmount ? Number(formatUnits(investmentAmount, 6)) : 0
        const monthlyIncomeNum = monthlyIncome ? Number(formatUnits(monthlyIncome, 6)) : 0

        if (balanceNum > 0) {
            totalInvested += investmentAmountNum
            totalMonthlyIncome += monthlyIncomeNum
            propertyCount++
        }

        return { balanceNum, investmentAmountNum, monthlyIncomeNum }
    })

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Cashflow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-brand-green">
                        +${totalMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {propertyCount}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PortfolioPage() {
    const { address } = useAccount()
    const { properties, favorites } = useProperties()

    // Find favorite property objects
    const favoriteProperties = properties.filter(p => favorites.includes(p.id))

    return (
        <div className="container py-12 max-w-4xl px-4">
            <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>

            <div className="grid gap-6">
                {/* Stats Cards */}
                {address ? (
                    <PortfolioStats properties={properties} address={address} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$0.00</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Est. Monthly Cashflow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-brand-green">+$0.00</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* User's Assets */}
                {address ? (
                    <>
                        <h2 className="text-xl font-bold mt-8">Your Assets</h2>
                        <div className="space-y-4">
                            {properties.map(property => (
                                <PropertyInvestment key={property.id} property={property} address={address} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Connect your wallet to view your portfolio.</p>
                    </div>
                )}

                {/* Wishlist Section */}
                {favoriteProperties.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold mt-8">My Wishlist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoriteProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
