"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProperties } from "@/context/property-context"
import { usePropertyFactory } from "@/hooks/usePropertyFactory"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Upload } from "lucide-react"
import { useAccount } from "wagmi"
import { Property } from "@/data/properties"
import { useState, FormEvent } from "react"

export default function CreatePropertyPage() {
    const { refetchProperties, addProperty } = useProperties()
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
        title: "",
        location: "",
        totalValue: "",
        yield: "",
        description: "",
        tags: ""
    })
    const [images, setImages] = useState<string[]>([])
    const [imageInput, setImageInput] = useState("")

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!address) {
            toast.error("Please connect your wallet")
            return
        }

        const totalValueNum = parseFloat(formData.totalValue)
        const yieldNum = parseFloat(formData.yield)

        // Basic Validation
        if (!formData.title || !formData.location || !formData.description || isNaN(totalValueNum) || isNaN(yieldNum)) {
            toast.error("Please fill in all required fields correctly.")
            return
        }

        // Generate random 3-4 uppercase letter token symbol
        const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let randomSymbol = ""
        const length = Math.floor(Math.random() * 2) + 3 // 3 or 4
        for (let i = 0; i < length; i++) {
            randomSymbol += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
        }

        // Parse tags
        const tagsArray = formData.tags
            ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : ["New Listing"]

        const newProperty: Property = {
            id: `prop-${Date.now()}`,
            title: formData.title,
            location: formData.location,
            imageUrl: images.length > 0 ? images[0] : "/dubai-downtown.png", // First image or default
            images: images.length > 0 ? images : undefined, // Include all images
            projectedYield: formData.yield + "%",
            minInvestment: "$50", // Default string
            funded: 0,
            investorCount: 0,
            totalValue: "$" + totalValueNum.toLocaleString(),
            description: formData.description,
            tags: tagsArray.length > 0 ? tagsArray : ["New Listing"],
            tokenSymbol: randomSymbol
        }

        addProperty(newProperty)
        toast.success("Property Listed Successfully!", {
            description: `${formData.title} has been added to the marketplace.`
        })

        // Reset form
        setFormData({
            title: "",
            location: "",
            totalValue: "",
            yield: "",
            description: "",
            tags: ""
        })
        setImages([])
        setImageInput("")

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
        <div className="container max-w-2xl py-12 px-4 mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-brand-green">
                <ArrowLeft className="nr-2 h-4 w-4" /> Back to Marketplace
            </Button>

            <div className="mb-8 text-center">
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the property, its features, location benefits, and investment potential..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                This description will be visible to investors on the property details page.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Optional)</Label>
                            <Input
                                id="tags"
                                placeholder="e.g. Luxury, High Yield, Beachfront"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated tags to help investors find your property (e.g., "Luxury, Waterfront, High Yield")
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalValue">Total Asset Value ($)</Label>
                                <Input
                                    id="totalValue"
                                    type="number"
                                    step="0.01"
                                    placeholder="1250000"
                                    value={formData.totalValue}
                                    onChange={e => setFormData({ ...formData, totalValue: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yield">Expected Monthly Income ($)</Label>
                                <Input
                                    id="yield"
                                    type="number"
                                    step="0.01"
                                    placeholder="6250"
                                    value={formData.yield}
                                    onChange={e => setFormData({ ...formData, yield: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Annual yield will be calculated as: (Monthly Income × 12 / Total Value) × 100%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="image">Property Images (Optional)</Label>
                                <p className="text-xs text-muted-foreground mb-2">Add up to 3 images to showcase your property</p>
                                <div className="flex gap-2">
                                    <Input
                                        id="image"
                                        placeholder="https://..."
                                        value={imageInput}
                                        onChange={e => setImageInput(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (!imageInput.trim()) {
                                                toast.error("Please enter an image URL")
                                                return
                                            }
                                            if (images.length >= 3) {
                                                toast.error("Maximum 3 images allowed")
                                                return
                                            }
                                            if (images.includes(imageInput.trim())) {
                                                toast.error("This image URL is already added")
                                                return
                                            }
                                            setImages([...images, imageInput.trim()])
                                            setImageInput("")
                                            toast.success(`Image added (${images.length + 1}/3)`)
                                        }}
                                    >
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Display added images */}
                            {images.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Added Images ({images.length}/3):</p>
                                    <div className="space-y-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                                                    <p className="text-sm truncate text-muted-foreground">{img}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Leave empty to use a default luxury placeholder. First image will be used as the main thumbnail.
                            </p>
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
