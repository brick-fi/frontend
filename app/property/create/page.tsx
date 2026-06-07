"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProperties } from "@/context/property-context"
import { usePropertyFactory } from "@/hooks/usePropertyFactory"
import { PropertyFactoryABI } from "@/lib/abis/PropertyFactory"
import { CONTRACTS } from "@/lib/contracts"
import { buildDraftSignatureMessage } from "@/lib/property-generation/signature"
import { ROOM_IMAGE_COUNT } from "@/lib/property-generation/types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useAccount, useSignMessage } from "wagmi"
import { toast } from "sonner"
import { ArrowLeft, Box, CheckCircle2, Loader2 } from "lucide-react"

type GenerationStage = 'idle' | 'uploading' | 'starting' | 'waiting_world_labs' | 'finalizing' | 'ready' | 'failed'

interface DraftResponse {
    draftId: string
    status: string
    draftAccessToken: string
}

interface StatusResponse {
    job?: {
        status: string
        error: string | null
    }
    error?: string
}

interface FinalizeResponse {
    metadataURI?: string
    error?: string
}

interface ListingFormData {
    title: string
    location: string
    totalValue: string
    yield: string
    description: string
    tags: string
}

interface PendingDraftState {
    draftId: string
    draftAccessToken: string
    metadataURI: string | null
    generationStage: GenerationStage
    formData: ListingFormData
}

const PENDING_DRAFT_STORAGE_KEY = 'brickfi-pending-property-draft'
const GENERATION_STAGES: GenerationStage[] = ['idle', 'uploading', 'starting', 'waiting_world_labs', 'finalizing', 'ready', 'failed']

function isGenerationStage(value: unknown): value is GenerationStage {
    return typeof value === 'string' && GENERATION_STAGES.includes(value as GenerationStage)
}

function emptyListingFormData(): ListingFormData {
    return {
        title: "",
        location: "",
        totalValue: "",
        yield: "",
        description: "",
        tags: ""
    }
}

function parsePendingDraft(value: string | null): PendingDraftState | null {
    if (!value) return null
    try {
        const parsed: unknown = JSON.parse(value)
        if (typeof parsed !== 'object' || parsed === null) return null
        const pending = parsed as Record<string, unknown>
        const formData = pending.formData as Partial<ListingFormData> | undefined
        if (
            typeof pending.draftId !== 'string' ||
            typeof pending.draftAccessToken !== 'string' ||
            !isGenerationStage(pending.generationStage) ||
            typeof formData?.title !== 'string' ||
            typeof formData.location !== 'string' ||
            typeof formData.totalValue !== 'string' ||
            typeof formData.yield !== 'string' ||
            typeof formData.description !== 'string' ||
            typeof formData.tags !== 'string'
        ) {
            return null
        }

        return {
            draftId: pending.draftId,
            draftAccessToken: pending.draftAccessToken,
            metadataURI: typeof pending.metadataURI === 'string' ? pending.metadataURI : null,
            generationStage: pending.generationStage,
            formData: {
                title: formData.title,
                location: formData.location,
                totalValue: formData.totalValue,
                yield: formData.yield,
                description: formData.description,
                tags: formData.tags,
            },
        }
    } catch {
        return null
    }
}

async function readJson<T>(response: Response): Promise<T> {
    const payload = await response.json()
    if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Request failed'
        throw new Error(message)
    }
    return payload as T
}

function randomTokenSymbol() {
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const length = Math.floor(Math.random() * 2) + 3
    let randomSymbol = ""
    for (let i = 0; i < length; i++) {
        randomSymbol += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    }
    return randomSymbol
}

export default function CreatePropertyPage() {
    const { refetchProperties } = useProperties()
    const { address } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [txSubmitted, setTxSubmitted] = useState(false)
    const [draftId, setDraftId] = useState<string | null>(null)
    const [draftAccessToken, setDraftAccessToken] = useState<string | null>(null)
    const [metadataURI, setMetadataURI] = useState<string | null>(null)
    const [generationStage, setGenerationStage] = useState<GenerationStage>('idle')

    const {
        createProperty,
        isCreatingProperty,
        isWaitingForCreate,
        isCreateSuccess,
        isCreatePropertyError,
        createPropertyError
    } = usePropertyFactory()

    const [formData, setFormData] = useState<ListingFormData>(emptyListingFormData)
    const [images, setImages] = useState<File[]>([])

    const tagsArray = useMemo(
        () => formData.tags
            ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : ["New Listing"],
        [formData.tags]
    )

    const formReady = Boolean(
        address &&
        formData.title &&
        formData.location &&
        formData.description &&
        formData.totalValue &&
        formData.yield &&
        images.length === ROOM_IMAGE_COUNT
    )

    const inputsLocked = generationStage !== 'idle' && generationStage !== 'failed'
    const generationInProgress = generationStage === 'uploading' || generationStage === 'starting' || generationStage === 'waiting_world_labs' || generationStage === 'finalizing'
    const imagePreviews = useMemo(
        () => images.map((image) => ({ image, url: URL.createObjectURL(image) })),
        [images]
    )

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
        }
    }, [imagePreviews])

    useEffect(() => {
        const pending = parsePendingDraft(window.sessionStorage.getItem(PENDING_DRAFT_STORAGE_KEY))
        if (!pending) return

        setDraftId(pending.draftId)
        setDraftAccessToken(pending.draftAccessToken)
        setMetadataURI(pending.metadataURI)
        setFormData(pending.formData)
        if (pending.generationStage === 'finalizing') {
            setGenerationStage('waiting_world_labs')
        } else if (pending.generationStage === 'uploading' || pending.generationStage === 'starting') {
            setGenerationStage('failed')
        } else {
            setGenerationStage(pending.generationStage)
        }
    }, [])

    useEffect(() => {
        if (!draftId || !draftAccessToken) return

        window.sessionStorage.setItem(PENDING_DRAFT_STORAGE_KEY, JSON.stringify({
            draftId,
            draftAccessToken,
            metadataURI,
            generationStage,
            formData,
        }))
    }, [draftAccessToken, draftId, formData, generationStage, metadataURI])

    useEffect(() => {
        if (isCreateSuccess && txSubmitted) {
            toast.success("Property created successfully on blockchain!")
            setTxSubmitted(false)
            setFormData({
                title: "",
                location: "",
                totalValue: "",
                yield: "",
                description: "",
                tags: ""
            })
            setImages([])
            setDraftId(null)
            setDraftAccessToken(null)
            setMetadataURI(null)
            setGenerationStage('idle')
            window.sessionStorage.removeItem(PENDING_DRAFT_STORAGE_KEY)
            refetchProperties()
            setTimeout(() => router.push("/"), 1000)
        }
    }, [isCreateSuccess, txSubmitted, refetchProperties, router])

    useEffect(() => {
        if (isCreatePropertyError && createPropertyError) {
            toast.error("Transaction failed", { description: createPropertyError.message })
            setLoading(false)
        }
    }, [isCreatePropertyError, createPropertyError])

    const finalizeMetadata = useCallback(async (currentDraftId: string, currentDraftAccessToken: string) => {
        setGenerationStage('finalizing')
        try {
            const finalized = await readJson<FinalizeResponse>(await fetch(`/api/property-generation/drafts/${currentDraftId}/finalize-metadata`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${currentDraftAccessToken}` },
            }))
            if (!finalized.metadataURI) {
                throw new Error(finalized.error || 'Metadata finalization failed')
            }
            setMetadataURI(finalized.metadataURI)
            setGenerationStage('ready')
            toast.success("3D room model is ready. You can now mint the listing.")
        } catch (error) {
            setGenerationStage('waiting_world_labs')
            throw error
        }
    }, [])

    const pollGenerationStatus = useCallback(async () => {
        if (!draftId || !draftAccessToken || generationStage === 'ready' || generationStage === 'finalizing') return

        const status = await readJson<StatusResponse>(await fetch(`/api/property-generation/drafts/${draftId}/status`, {
            headers: { Authorization: `Bearer ${draftAccessToken}` },
        }))
        if (!status.job) return

        if (status.job.status === 'succeeded') {
            await finalizeMetadata(draftId, draftAccessToken)
            return
        }

        if (status.job.status === 'failed') {
            setGenerationStage('failed')
            toast.error("3D room generation failed", {
                description: status.job.error || "Please try again with clearer room photos."
            })
        }
    }, [draftAccessToken, draftId, finalizeMetadata, generationStage])

    useEffect(() => {
        if (!draftId || !draftAccessToken || generationStage !== 'waiting_world_labs') return
        const interval = window.setInterval(() => {
            pollGenerationStatus().catch(error => {
                toast.error("Failed to check 3D generation status", {
                    description: error instanceof Error ? error.message : "Unknown error"
                })
            })
        }, 10000)

        return () => window.clearInterval(interval)
    }, [draftAccessToken, draftId, generationStage, pollGenerationStatus])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const fileArray = Array.from(files)
        const validFiles = fileArray.filter(file => file.type.startsWith('image/'))

        if (validFiles.length !== fileArray.length) {
            toast.error("Please select only image files")
            return
        }

        const remainingSlots = ROOM_IMAGE_COUNT - images.length
        const filesToAdd = validFiles.slice(0, remainingSlots)
        if (validFiles.length > remainingSlots) {
            toast.error(`Exactly ${ROOM_IMAGE_COUNT} images are required. Only first ${remainingSlots} images were added.`)
        }

        setImages([...images, ...filesToAdd])
        e.target.value = ''
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const createDraftAndGenerate = async () => {
        if (!address) {
            toast.error("Please connect your wallet")
            return
        }

        const totalValueNum = parseFloat(formData.totalValue)
        const expectedMonthlyIncomeNum = parseFloat(formData.yield)
        if (!formData.title || !formData.location || !formData.description || isNaN(totalValueNum) || isNaN(expectedMonthlyIncomeNum)) {
            toast.error("Please fill in all required fields correctly.")
            return
        }

        if (images.length !== ROOM_IMAGE_COUNT) {
            toast.error(`Please upload exactly ${ROOM_IMAGE_COUNT} room photos.`)
            return
        }

        setLoading(true)
        try {
            setGenerationStage('uploading')
            const signatureIssuedAt = new Date().toISOString()
            const signatureMessage = buildDraftSignatureMessage({
                walletAddress: address,
                title: formData.title,
                location: formData.location,
                description: formData.description,
                totalValue: totalValueNum,
                expectedMonthlyIncome: expectedMonthlyIncomeNum,
                tags: tagsArray,
                signatureIssuedAt,
            })
            const walletSignature = await signMessageAsync({ message: signatureMessage })
            const draft = await readJson<DraftResponse>(await fetch('/api/property-generation/drafts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    signatureMessage,
                    signatureIssuedAt,
                    walletSignature,
                    title: formData.title,
                    location: formData.location,
                    description: formData.description,
                    totalValue: totalValueNum,
                    expectedMonthlyIncome: expectedMonthlyIncomeNum,
                    tags: tagsArray,
                }),
            }))
            setDraftId(draft.draftId)
            setDraftAccessToken(draft.draftAccessToken)

            const roomImages = new FormData()
            images.forEach(image => roomImages.append('files', image))
            await readJson(await fetch(`/api/property-generation/drafts/${draft.draftId}/images`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${draft.draftAccessToken}` },
                body: roomImages,
            }))

            setGenerationStage('starting')
            await readJson(await fetch(`/api/property-generation/drafts/${draft.draftId}/start`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${draft.draftAccessToken}` },
            }))

            setGenerationStage('waiting_world_labs')
            toast.info("3D room generation started. This usually takes about 5 minutes.")
        } catch (error) {
            setGenerationStage('failed')
            toast.error("Failed to start 3D generation", {
                description: error instanceof Error ? error.message : "Unknown error"
            })
        } finally {
            setLoading(false)
        }
    }

    const mintProperty = () => {
        if (!metadataURI) {
            toast.error("Generate the 3D room model before minting the listing.")
            return
        }

        const totalValueNum = parseFloat(formData.totalValue)
        const expectedMonthlyIncomeNum = parseFloat(formData.yield)
        if (isNaN(totalValueNum) || isNaN(expectedMonthlyIncomeNum)) {
            toast.error("Invalid property financial values")
            return
        }

        createProperty({
            address: CONTRACTS.PROPERTY_FACTORY,
            abi: PropertyFactoryABI,
            functionName: 'createProperty',
            args: [formData.title, randomTokenSymbol(), {
                name: formData.title,
                location: formData.location,
                totalValue: BigInt(Math.round(totalValueNum * 1e6)),
                expectedMonthlyIncome: BigInt(Math.round(expectedMonthlyIncomeNum * 1e6)),
                metadataURI,
                isActive: true
            }]
        })
        setTxSubmitted(true)
        toast.success("Property transaction submitted. Please confirm in your wallet.")
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (metadataURI) {
            mintProperty()
            return
        }
        await createDraftAndGenerate()
    }

    const statusCopy = {
        idle: `Upload exactly ${ROOM_IMAGE_COUNT} room photos to generate a required 3D room model before minting.`,
        uploading: "Uploading room photos to secure server storage...",
        starting: "Starting World Labs room generation...",
        waiting_world_labs: "Generating 3D room model with World Labs. This usually takes about 5 minutes.",
        finalizing: "Finalizing IPFS metadata with generated 3D room assets...",
        ready: "3D room model is ready. Mint the property listing on-chain.",
        failed: "3D room generation failed. Review the photos and try again."
    }

    return (
        <div className="container max-w-3xl py-12 px-4 mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-brand-green">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
            </Button>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
                <p className="text-muted-foreground">Register a new asset with a required server-generated 3D room model.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Enter the listing details, then upload exactly {ROOM_IMAGE_COUNT} room photos for modeling.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Property Title</Label>
                            <Input id="title" placeholder="e.g. Luxury Penthouse in DIFC" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required disabled={inputsLocked} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" placeholder="e.g. Downtown Dubai, UAE" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required disabled={inputsLocked} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" placeholder="Describe the property, its room condition, location benefits, and investment potential..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={4} className="resize-none" disabled={inputsLocked} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Optional)</Label>
                            <Input id="tags" placeholder="e.g. Luxury, High Yield, Waterfront" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} disabled={inputsLocked} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalValue">Total Asset Value ($)</Label>
                                <Input id="totalValue" type="number" step="0.01" placeholder="1250000" value={formData.totalValue} onChange={e => setFormData({ ...formData, totalValue: e.target.value })} required disabled={inputsLocked} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yield">Expected Monthly Income ($)</Label>
                                <Input id="yield" type="number" step="0.01" placeholder="6250" value={formData.yield} onChange={e => setFormData({ ...formData, yield: e.target.value })} required disabled={inputsLocked} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="images" className="text-base">Room Photos *</Label>
                            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                                Take {ROOM_IMAGE_COUNT} photos from the same room with consistent lighting and overlapping views. World Labs works best when all images share the same aspect ratio and resolution.
                            </div>

                            <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} disabled={loading || inputsLocked || images.length >= ROOM_IMAGE_COUNT} />

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={`${preview.image.name}-${index}`} className="relative group">
                                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-brand-green transition-colors">
                                                <Image src={preview.url} alt={`Room ${index + 1}`} fill unoptimized className="object-cover" />
                                            </div>
                                            {!inputsLocked && (
                                                <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" disabled={loading}>
                                                    <span className="sr-only">Remove image</span>
                                                    ×
                                                </button>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1 truncate px-1" title={preview.image.name}>{preview.image.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">{images.length} of {ROOM_IMAGE_COUNT} room photos selected.</p>
                        </div>

                        <div className="rounded-lg border border-border p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                {generationStage === 'ready' ? <CheckCircle2 className="h-5 w-5 text-brand-green" /> : generationStage === 'idle' || generationStage === 'failed' ? <Box className="h-5 w-5 text-muted-foreground" /> : <Loader2 className="h-5 w-5 animate-spin text-brand-green" />}
                                <div>
                                    <p className="font-medium">3D Room Generation</p>
                                    <p className="text-sm text-muted-foreground">{statusCopy[generationStage]}</p>
                                </div>
                            </div>
                            {metadataURI && <p className="text-xs text-muted-foreground break-all">Metadata URI: {metadataURI}</p>}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" size="lg" disabled={loading || isCreatingProperty || isWaitingForCreate || (!metadataURI && !formReady) || generationInProgress} className="bg-brand-green text-black hover:bg-brand-green/90 w-full md:w-auto">
                                {!address ? "Connect Wallet" :
                                    metadataURI ?
                                        isCreatingProperty ? "Confirm in Wallet..." : isWaitingForCreate ? "Processing Transaction..." : "Mint Property Listing" :
                                        generationStage === 'uploading' ? "Uploading Room Photos..." :
                                        generationStage === 'starting' ? "Starting 3D Generation..." :
                                        generationStage === 'waiting_world_labs' ? "Generating 3D Room..." :
                                        generationStage === 'finalizing' ? "Finalizing Metadata..." :
                                        "Generate 3D Room"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
