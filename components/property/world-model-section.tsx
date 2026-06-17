"use client"

import { Property } from "@/data/properties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Box, ExternalLink } from "lucide-react"

interface WorldModelSectionProps {
    property: Property
}

function getSafeHttpsUrl(value: string | null | undefined) {
    if (!value) return null
    try {
        const url = new URL(value)
        return url.protocol === 'https:' ? url.toString() : null
    } catch {
        return null
    }
}

function getTrustedWorldLabsUrl(value: string | null | undefined) {
    const safeUrl = getSafeHttpsUrl(value)
    if (!safeUrl) return null
    const url = new URL(safeUrl)
    const hostname = url.hostname.toLowerCase()
    return hostname === 'worldlabs.ai' || hostname.endsWith('.worldlabs.ai') ? safeUrl : null
}

export function WorldModelSection({ property }: WorldModelSectionProps) {
    const worldModel = property.worldModel
    if (!worldModel) return null

    const trustedWorldMarbleUrl = getTrustedWorldLabsUrl(worldModel.worldMarbleUrl)
    const safeWorldMarbleUrl = getSafeHttpsUrl(worldModel.worldMarbleUrl)
    const safeThumbnailUrl = getSafeHttpsUrl(worldModel.thumbnailUrl)

    return (
        <section className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-brand-green" />
                        <h3 className="text-xl font-semibold">3D Room Model</h3>
                        <Badge variant="secondary">World Labs</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This listing includes a server-generated 3D room model created from the seller&apos;s required room photo set.
                    </p>
                </div>
                {safeWorldMarbleUrl && (
                    <Button asChild variant="outline" className="gap-2">
                        <a href={safeWorldMarbleUrl} target="_blank" rel="noopener noreferrer">
                            Open 3D World <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}
            </div>

            {trustedWorldMarbleUrl ? (
                <div className="aspect-video border-t border-border bg-black">
                    <iframe
                        src={trustedWorldMarbleUrl}
                        title={`${property.title} 3D room model`}
                        className="h-full w-full"
                        allow="fullscreen; xr-spatial-tracking"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-presentation"
                    />
                </div>
            ) : safeThumbnailUrl ? (
                <div className="aspect-video border-t border-border bg-cover bg-center" style={{ backgroundImage: `url(${safeThumbnailUrl})` }} />
            ) : safeWorldMarbleUrl ? (
                <div className="aspect-video border-t border-border bg-secondary/30 p-6 flex items-center justify-center">
                    <Button asChild variant="outline" className="gap-2">
                        <a href={safeWorldMarbleUrl} target="_blank" rel="noopener noreferrer">
                            Open 3D World <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            ) : null}
        </section>
    )
}
