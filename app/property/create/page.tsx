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
import { PropertyFactoryABI } from "@/lib/abis/PropertyFactory"
import { CONTRACTS } from "@/lib/contracts"
import { useState, FormEvent, useEffect } from "react"

type UploadProgress = {
    current: number
    total: number
    currentFileName: string
}

export default function CreatePropertyPage() {
    const { refetchProperties, addProperty } = useProperties()
    const { address } = useAccount()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [txSubmitted, setTxSubmitted] = useState(false)

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
    const [images, setImages] = useState<File[]>([])
    const [uploadingImages, setUploadingImages] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

    // Handle transaction success
    useEffect(() => {
        if (isCreateSuccess && txSubmitted) {
            toast.success("Property created successfully on blockchain!")
            setTxSubmitted(false)

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
            setUploadProgress(null)

            // Refetch properties and redirect
            refetchProperties()
            setTimeout(() => {
                router.push("/")
            }, 1000)
        }
    }, [isCreateSuccess, txSubmitted, refetchProperties, router])

    // Handle transaction error
    useEffect(() => {
        if (isCreatePropertyError && createPropertyError) {
            toast.error("Transaction failed", {
                description: createPropertyError.message
            })
            setLoading(false)
            setUploadingImages(false)
        }
    }, [isCreatePropertyError, createPropertyError])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const fileArray = Array.from(files)

        // Validate file types
        const validFiles = fileArray.filter(file => file.type.startsWith('image/'))

        if (validFiles.length !== fileArray.length) {
            toast.error("Please select only image files")
            return
        }

        // Append new images to existing ones, max 3 total
        const remainingSlots = 3 - images.length
        const filesToAdd = validFiles.slice(0, remainingSlots)

        if (validFiles.length > remainingSlots) {
            toast.error(`Maximum 3 images allowed. Only first ${remainingSlots} images will be added.`)
        }

        setImages([...images, ...filesToAdd])
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

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

        // Check if images are provided (required)
        if (images.length === 0) {
            toast.error("Please upload at least one property image.")
            return
        }

        try {
            setUploadingImages(true)
            setLoading(true)

            // Upload images to IPFS
            toast.info("Uploading images to IPFS...")
            const imageURIs: string[] = []

            for (let i = 0; i < images.length; i++) {
                const image = images[i]
                setUploadProgress({
                    current: i + 1,
                    total: images.length,
                    currentFileName: image.name
                })

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

            toast.success("Images uploaded to IPFS!", {
                description: `${imageURIs.length} image(s) successfully uploaded`
            })

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

            // Calculate annual yield from monthly income
            const annualYield = totalValueNum > 0 ? ((yieldNum * 12) / totalValueNum * 100).toFixed(2) : "0"

            // First, upload metadata to IPFS
            const metadata = {
                name: formData.title,
                description: formData.description,
                images: imageURIs,
                location: formData.location,
                totalValue: totalValueNum,
                expectedMonthlyIncome: yieldNum,
                annualYield: annualYield,
                tags: tagsArray
            }

            toast.info("Uploading metadata to IPFS...")
            const metadataResponse = await fetch('/api/ipfs/upload-metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metadata }),
            })

            if (!metadataResponse.ok) {
                throw new Error("Failed to upload metadata to IPFS")
            }

            const { ipfsHash: metadataHash } = await metadataResponse.json()
            const metadataURI = `ipfs://${metadataHash}`

            toast.info("Creating property on blockchain...")

            // Prepare PropertyInfo struct for the smart contract
            const propertyInfo = {
                name: formData.title,
                location: formData.location,
                totalValue: BigInt(Math.round(totalValueNum * 1e6)), // Convert to USDC decimals (6)
                expectedMonthlyIncome: BigInt(Math.round(yieldNum * 1e6)), // Convert to USDC decimals (6)
                metadataURI: metadataURI,
                isActive: true
            }

            // Create property on blockchain using wagmi writeContract
            createProperty({
                address: CONTRACTS.PROPERTY_FACTORY,
                abi: PropertyFactoryABI,
                functionName: 'createProperty',
                args: [formData.title, randomSymbol, propertyInfo]
            })

            // Set flag that transaction was submitted
            setTxSubmitted(true)
            toast.success("Property transaction submitted! Please confirm in your wallet...")
        } catch (error) {
            console.error("Error creating property:", error)
            toast.error("Failed to create property", {
                description: error instanceof Error ? error.message : "An unknown error occurred"
            })
        } finally {
            setUploadingImages(false)
            setLoading(false)
        }
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

                                    {uploadingImages && uploadProgress && (
                                        <div className="mt-3 p-3 bg-brand-green/10 border border-brand-green/20 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-brand-green border-t-transparent rounded-full"></div>
                                                <span className="text-sm font-medium text-brand-green">
                                                    Uploading to IPFS: {uploadProgress.current} of {uploadProgress.total}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                Current file: {uploadProgress.currentFileName}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading || !formData.title || !formData.location || !formData.description || !formData.totalValue || !formData.yield || !address || images.length === 0 || uploadingImages || isCreatingProperty || isWaitingForCreate}
                                className="bg-brand-green text-black hover:bg-brand-green/90 w-full md:w-auto"
                            >
                                {!address ? "Connect Wallet" :
                                    uploadingImages && uploadProgress ?
                                        `Uploading ${uploadProgress.current}/${uploadProgress.total} images...` :
                                    uploadingImages ? "Uploading Images..." :
                                        isCreatingProperty ? "Confirm in Wallet..." :
                                        isWaitingForCreate ? "Processing Transaction..." :
                                        loading ? "Preparing..." :
                                            "List Property"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
