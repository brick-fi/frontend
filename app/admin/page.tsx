"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Wallet, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useProperties } from "@/context/property-context"
import { usePropertyToken } from "@/hooks/usePropertyToken"
import { PropertyTokenABI } from "@/lib/abis/PropertyToken"
import { parseUnits } from "viem"
import Image from "next/image"
import { useDemoUSDC } from "@/hooks/useDemoUSDC"

interface PropertyForDistribution {
    id: string
    name: string
    location: string
    imageUrl: string
    investorCount: number
}

// Individual property distribution card
function PropertyDistributionCard({ property }: { property: PropertyForDistribution }) {
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const propertyAddress = property.id as `0x${string}`
    const { distributeRevenue, isDistributing, isWaitingForDistribute, isDistributeSuccess, distributeError } = usePropertyToken(propertyAddress)
    const { address } = useAccount()
    const usdcAddress = process.env.NEXT_PUBLIC_DEMO_USDC_ADDRESS as `0x${string}`
    const { approve, isApproveSuccess } = useDemoUSDC()

    // Track state for flow
    const [approvalAmount, setApprovalAmount] = useState<bigint | null>(null)
    const [approvalDescription, setApprovalDescription] = useState<string>("")

    useEffect(() => {
        // After approval succeeds, trigger distribution
        if (isApproveSuccess && approvalAmount !== null) {
            toast.info("Approving successful! Distributing revenue to all investors...")
            setTimeout(() => {
                distributeRevenue({
                    address: propertyAddress,
                    abi: PropertyTokenABI,
                    functionName: "distributeRevenue",
                    args: [approvalAmount, approvalDescription],
                } as any)
                setApprovalAmount(null)
                setApprovalDescription("")
            }, 500)
        }
    }, [isApproveSuccess])

    useEffect(() => {
        if (isDistributeSuccess) {
            toast.success("Revenue distributed successfully! All investors will receive their automatic distribution.")
            setAmount("")
            setDescription("")
            setIsLoading(false)
        }
    }, [isDistributeSuccess])

    useEffect(() => {
        if (distributeError) {
            toast.error(distributeError?.message || "Failed to distribute revenue")
            setIsLoading(false)
        }
    }, [distributeError])

    const handleDistribute = async () => {
        if (!address) {
            toast.error("Please connect your wallet")
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        if (!description.trim()) {
            toast.error("Please enter a description")
            return
        }

        try {
            // Convert to USDC amount (6 decimals)
            const usdcAmount = parseUnits(amount, 6)

            // Store for next step
            setApprovalAmount(usdcAmount)
            setApprovalDescription(description)

            // Step 1: Approve USDC
            toast.info("Approving USDC...")
            setIsLoading(true)

            const ERC20_ABI = [
                {
                    name: "approve",
                    type: "function",
                    stateMutability: "nonpayable",
                    inputs: [
                        { name: "spender", type: "address" },
                        { name: "amount", type: "uint256" }
                    ],
                    outputs: [{ name: "", type: "bool" }]
                }
            ] as const

            approve({
                address: usdcAddress,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [propertyAddress, usdcAmount],
            })

        } catch (error: any) {
            console.error("Distribution error:", error)
            toast.error(error?.message || "Distribution failed")
            setIsLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Property Image */}
                    <div className="h-20 w-20 rounded-md bg-muted overflow-hidden relative flex-shrink-0">
                        <Image
                            src={property.imageUrl}
                            alt={property.name}
                            fill
                            className="object-cover"
                            unoptimized={property.imageUrl.includes('ipfs')}
                        />
                    </div>

                    {/* Property Info & Form */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{property.name}</h3>
                            <p className="text-sm text-muted-foreground">{property.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {property.investorCount} {property.investorCount === 1 ? 'Investor' : 'Investors'}
                            </p>
                        </div>

                        {/* Distribution Form */}
                        <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Amount (USDC)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="pl-9"
                                            step="0.01"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Description</label>
                                    <Input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g. January 2026 Rent"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleDistribute}
                                disabled={isLoading || isDistributing || isWaitingForDistribute || !amount || !description}
                                className="w-full"
                            >
                                {isLoading || isDistributing || isWaitingForDistribute ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isLoading ? "Approving USDC..." : "Distributing..."}
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Distribute Revenue
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
    const { address } = useAccount()
    const { properties, isLoading: propertiesLoading } = useProperties()
    const [myProperties, setMyProperties] = useState<PropertyForDistribution[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter properties owned by the current user
    useEffect(() => {
        const loadMyProperties = async () => {
            // Wait for properties to load from blockchain
            if (propertiesLoading) {
                return
            }

            if (!address || !properties || properties.length === 0) {
                setMyProperties([])
                setIsLoading(false)
                return
            }

            try {
                // For each property, check if the current user is the owner
                const ownershipChecks = await Promise.all(
                    properties.map(async (property) => {
                        try {
                            const propertyAddress = property.id as `0x${string}`

                            // Use eth_call to check if user has ADMIN_ROLE
                            // For simplicity, we'll check if user has any role by checking if they created it
                            // In a real scenario, you'd want to call hasRole(ADMIN_ROLE, address)

                            // For now, we'll show all properties (you can add role checking later)
                            return {
                                property,
                                isOwner: true // TODO: Add proper role checking
                            }
                        } catch (error) {
                            console.error(`Error checking ownership for ${property.id}:`, error)
                            return { property, isOwner: false }
                        }
                    })
                )

                const ownedProperties = ownershipChecks
                    .filter(check => check.isOwner)
                    .map(check => ({
                        id: check.property.id,
                        name: check.property.title,
                        location: check.property.location,
                        imageUrl: check.property.imageUrl,
                        investorCount: check.property.investorCount || 0
                    }))

                setMyProperties(ownedProperties)
            } catch (error) {
                console.error("Error loading properties:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadMyProperties()
    }, [address, properties, propertiesLoading])

    if (!address) {
        return (
            <div className="container py-12 max-w-4xl px-4 mx-auto">
                <Card>
                    <CardContent className="py-12 text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                        <p className="text-muted-foreground">
                            Please connect your wallet to access the admin dashboard
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-12 max-w-6xl px-4 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Distribute rental income to your property investors</p>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Loading your properties...</p>
                    </CardContent>
                </Card>
            ) : myProperties.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                        <p className="text-muted-foreground mb-6">
                            You don't own any properties yet. Create a property to start distributing revenue.
                        </p>
                        <Button asChild>
                            <a href="/property/create">Create Property</a>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Properties</CardTitle>
                            <CardDescription>
                                Manage rental income distributions for {myProperties.length} {myProperties.length === 1 ? 'property' : 'properties'}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {myProperties.map((property) => (
                        <PropertyDistributionCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    )
}
