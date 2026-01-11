"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProperties } from "@/context/property-context"
import { usePropertyFactory } from "@/hooks/usePropertyFactory"
import { useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { toast } from "sonner"
import { ArrowLeft, Upload } from "lucide-react"
import { parseUnits } from "viem"
import { useAccount } from "wagmi"
import { PropertyFactoryABI } from "@/lib/abis/PropertyFactory"
import { CONTRACTS } from "@/lib/contracts"

export default function CreatePropertyPage() {
    const { refetchProperties } = useProperties()
    const { address } = useAccount()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        createProperty,
        isCreatingProperty,
        isWaitingForCreate,
        isCreateSuccess,
        isCreatePropertyError,
        createPropertyError
    } = usePropertyFactory()

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        symbol: "",
        location: "",
        totalValue: "",
        expectedMonthlyIncome: "",
        metadataURI: "", // IPFS URI
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!address) {
            toast.error("Please connect your wallet")
            return
        }

        const totalValue = parseFloat(formData.totalValue)
        const monthlyIncome = parseFloat(formData.expectedMonthlyIncome)

        // Basic Validation
        if (!formData.name || !formData.symbol || !formData.location || isNaN(totalValue) || isNaN(monthlyIncome)) {
            toast.error("Please fill in all fields correctly.")
            return
        }

        if (monthlyIncome > totalValue) {
            toast.error("Monthly income cannot exceed total value")
            return
        }

        try {
            // Convert to USDC units (6 decimals)
            const totalValueUSDC = parseUnits(totalValue.toString(), 6)
            const monthlyIncomeUSDC = parseUnits(monthlyIncome.toString(), 6)

            // PropertyInfo struct
            const propertyInfo = {
                name: formData.name,
                location: formData.location,
                totalValue: totalValueUSDC,
                expectedMonthlyIncome: monthlyIncomeUSDC,
                metadataURI: formData.metadataURI || "", // Optional IPFS URI
                isActive: true
            }

            toast.info("Creating property...")

            // Call contract
            createProperty({
                address: CONTRACTS.PROPERTY_FACTORY,
                abi: PropertyFactoryABI,
                functionName: 'createProperty',
                args: [formData.name, formData.symbol, propertyInfo]
            })
        } catch (error) {
            console.error("Property creation error:", error)
            toast.error("Failed to create property")
        }
    }

    // Handle success
    if (isCreateSuccess) {
        toast.success("Property Created Successfully!", {
            description: `${formData.name} has been tokenized on the blockchain.`
        })
        refetchProperties()
        router.push("/")
    }

    // Handle error
    if (isCreatePropertyError && createPropertyError) {
        toast.error("Property creation failed", {
            description: createPropertyError.message
        })
    }

    return (
        <div className="container max-w-2xl py-12 px-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-brand-green">
                <ArrowLeft className="nr-2 h-4 w-4" /> Back to Marketplace
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
                <p className="text-muted-foreground">Register a new asset for tokenization on BrickFi.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Enter the core info for potential investors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="name">Property Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Luxury Penthouse DIFC"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="symbol">Token Symbol</Label>
                            <Input
                                id="symbol"
                                placeholder="e.g. LPD (3-4 letters)"
                                value={formData.symbol}
                                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                maxLength={4}
                                required
                            />
                            <p className="text-xs text-muted-foreground">3-4 uppercase letters for the property token</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Downtown Dubai, UAE"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalValue">Total Asset Value (USDC)</Label>
                                <Input
                                    id="totalValue"
                                    type="number"
                                    step="0.01"
                                    placeholder="2500000"
                                    value={formData.totalValue}
                                    onChange={e => setFormData({ ...formData, totalValue: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expectedMonthlyIncome">Expected Monthly Income (USDC)</Label>
                                <Input
                                    id="expectedMonthlyIncome"
                                    type="number"
                                    step="0.01"
                                    placeholder="12500"
                                    value={formData.expectedMonthlyIncome}
                                    onChange={e => setFormData({ ...formData, expectedMonthlyIncome: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metadataURI">Metadata URI (Optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="metadataURI"
                                    placeholder="ipfs://... or https://..."
                                    value={formData.metadataURI}
                                    onChange={e => setFormData({ ...formData, metadataURI: e.target.value })}
                                />
                                <Button type="button" variant="outline" size="icon" disabled>
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">IPFS URI for property images and additional details</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!address || isCreatingProperty || isWaitingForCreate}
                                className="bg-brand-green text-black hover:bg-brand-green/90 w-full md:w-auto"
                            >
                                {!address ? "Connect Wallet" : isCreatingProperty || isWaitingForCreate ? "Creating..." : "Create Property"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
