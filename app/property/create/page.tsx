"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProperties } from "@/context/property-context"
import { Property } from "@/data/properties"
import { useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { toast } from "sonner"
import { ArrowLeft, Upload } from "lucide-react"

export default function CreatePropertyPage() {
    const { addProperty } = useProperties()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        price: "",
        yield: "",
        imageUrl: "", // For now, we'll input a URL or use a default
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        const priceNum = parseFloat(formData.price)

        // Basic Validation
        if (!formData.title || !formData.price || isNaN(priceNum)) {
            toast.error("Please fill in all strict fields correctly.")
            setLoading(false)
            return
        }

        // Generate random 3-4 uppercase letter token symbol
        const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let randomSymbol = ""
        const length = Math.floor(Math.random() * 2) + 3 // 3 or 4
        for (let i = 0; i < length; i++) {
            randomSymbol += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
        }

        const newProperty: Property = {
            id: `prop-${Date.now()}`,
            title: formData.title,
            location: formData.location,
            imageUrl: formData.imageUrl || "/dubai-downtown.png", // Default image if empty
            projectedYield: formData.yield + "%",
            minInvestment: "$50", // Default string
            funded: 0,
            totalValue: "$" + priceNum.toLocaleString(),
            description: "New user-listed property.",
            tags: ["New Listing"],
            tokenSymbol: randomSymbol
        }

        addProperty(newProperty)
        toast.success("Property Listed Successfully!", {
            description: `${formData.title} has been added to the marketplace.`
        })
        router.push("/")
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
                            <Label htmlFor="title">Property Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Luxury Penthouse in DIFC"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
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
                                <Label htmlFor="price">Total Asset Value ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="2500000"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yield">Projected Annual Yield (%)</Label>
                                <Input
                                    id="yield"
                                    placeholder="6.5"
                                    value={formData.yield}
                                    onChange={e => setFormData({ ...formData, yield: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Image URL (Optional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="image"
                                    placeholder="https://..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                                <Button type="button" variant="outline" size="icon" disabled>
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty to use a default luxury placeholder.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" size="lg" disabled={loading} className="bg-brand-green text-black hover:bg-brand-green/90 w-full md:w-auto">
                                {loading ? "Listing..." : "List Property"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
