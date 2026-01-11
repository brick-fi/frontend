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
        location: "",
        totalValue: "",
        expectedMonthlyIncome: "",
    })

    const [images, setImages] = useState<File[]>([])
    const [uploadingImages, setUploadingImages] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!address) {
            toast.error("Please connect your wallet")
            return
        }

        const totalValue = parseFloat(formData.totalValue)
        const monthlyIncome = parseFloat(formData.expectedMonthlyIncome)

        // Basic Validation
        if (!formData.name || !formData.location || isNaN(totalValue) || isNaN(monthlyIncome)) {
            toast.error("Please fill in all fields correctly.")
            return
        }

        if (monthlyIncome > totalValue) {
            toast.error("Monthly income cannot exceed total value")
            return
        }

        if (images.length === 0) {
            toast.error("Please upload at least 1 image (max 3)")
            return
        }

        try {
            setUploadingImages(true)

            // Step 1: Upload images to IPFS
            toast.info("Uploading images to IPFS...")
            const imageURIs: string[] = []

            for (const image of images) {
                const formData = new FormData()
                formData.append('file', image)

                const response = await fetch('/api/ipfs/upload-image', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Failed to upload image: ${image.name}`)
                }

                const data = await response.json()
                imageURIs.push(data.ipfsURL) // ipfs://...
            }

            // Step 2: Create metadata object
            const metadata = {
                name: formData.name,
                description: `Property located in ${formData.location}`,
                location: formData.location,
                totalValue: totalValue,
                expectedMonthlyIncome: monthlyIncome,
                images: imageURIs,
                attributes: [
                    {
                        trait_type: "Total Value",
                        value: totalValue,
                        display_type: "number"
                    },
                    {
                        trait_type: "Monthly Income",
                        value: monthlyIncome,
                        display_type: "number"
                    },
                    {
                        trait_type: "Location",
                        value: formData.location
                    }
                ]
            }

            // Step 3: Upload metadata to IPFS
            toast.info("Uploading metadata to IPFS...")
            const metadataResponse = await fetch('/api/ipfs/upload-metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata),
            })

            if (!metadataResponse.ok) {
                throw new Error('Failed to upload metadata to IPFS')
            }

            const metadataData = await metadataResponse.json()
            const metadataURI = metadataData.metadataURI // ipfs://...

            setUploadingImages(false)

            // Step 4: Generate random 3-letter token symbol
            const randomSymbol = Array.from({ length: 3 }, () =>
                String.fromCharCode(65 + Math.floor(Math.random() * 26))
            ).join('')

            // Convert to USDC units (6 decimals)
            const totalValueUSDC = parseUnits(totalValue.toString(), 6)
            const monthlyIncomeUSDC = parseUnits(monthlyIncome.toString(), 6)

            // PropertyInfo struct
            const propertyInfo = {
                name: formData.name,
                location: formData.location,
                totalValue: totalValueUSDC,
                expectedMonthlyIncome: monthlyIncomeUSDC,
                metadataURI: metadataURI,
                isActive: true
            }

            toast.info("Creating property on blockchain...")

            // Call contract
            createProperty({
                address: CONTRACTS.PROPERTY_FACTORY,
                abi: PropertyFactoryABI,
                functionName: 'createProperty',
                args: [formData.name, randomSymbol, propertyInfo]
            })
        } catch (error) {
            console.error("Property creation error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create property")
            setUploadingImages(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const fileArray = Array.from(files).slice(0, 3) // Max 3 images

        // Validate file types
        const validFiles = fileArray.filter(file => file.type.startsWith('image/'))

        if (validFiles.length !== fileArray.length) {
            toast.error("Only image files are allowed")
            return
        }

        setImages(validFiles)
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
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

                        <div className="space-y-3">
                            <Label htmlFor="images" className="text-base">Property Images *</Label>

                            {images.length === 0 ? (
                                <div className="relative">
                                    <Input
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        disabled={uploadingImages}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="images"
                                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                            uploadingImages
                                                ? 'border-muted bg-muted/50 cursor-not-allowed'
                                                : 'border-border hover:border-brand-green hover:bg-brand-green/5'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className={`w-10 h-10 mb-3 ${uploadingImages ? 'text-muted-foreground' : 'text-brand-green'}`} />
                                            <p className="mb-2 text-sm font-medium">
                                                <span className="text-brand-green">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                1-3 images (PNG, JPG, max 10MB each)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-brand-green transition-colors">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Property ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                    disabled={uploadingImages}
                                                    title="Remove image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                                <p className="text-xs text-muted-foreground mt-1 truncate px-1" title={image.name}>
                                                    {image.name}
                                                </p>
                                            </div>
                                        ))}

                                        {images.length < 3 && (
                                            <div className="aspect-square">
                                                <Input
                                                    id={`images-add-${images.length}`}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                    disabled={uploadingImages}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor={`images-add-${images.length}`}
                                                    className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border hover:border-brand-green hover:bg-brand-green/5 rounded-lg cursor-pointer transition-all"
                                                >
                                                    <Upload className="w-8 h-8 text-brand-green mb-2" />
                                                    <p className="text-xs text-muted-foreground">Add more</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                        {images.length} of 3 images selected. Images will be stored on IPFS permanently.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={!address || isCreatingProperty || isWaitingForCreate || uploadingImages || images.length === 0}
                                className="bg-brand-green text-black hover:bg-brand-green/90 w-full md:w-auto"
                            >
                                {!address ? "Connect Wallet" :
                                 uploadingImages ? "Uploading to IPFS..." :
                                 isCreatingProperty || isWaitingForCreate ? "Creating on Blockchain..." :
                                 "Create Property"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
