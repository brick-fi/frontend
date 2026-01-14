"use client"

import Link from "next/link"
import Image from "next/image"
import { Property } from "@/data/properties"
import { Button } from "@/components/ui/button"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { useProperties } from "@/context/property-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface PropertyCardProps {
    property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
    const { isFavorite, toggleFavorite } = useProperties()
    const isFav = isFavorite(property.id)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Use images array if available, otherwise fallback to single imageUrl wrapped in array
    const images = property.images && property.images.length > 0 ? property.images : [property.imageUrl]

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="group relative overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg border border-border/50">
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                {/* Carousel Image */}
                <div className="relative h-full w-full">
                    <Image
                        src={images[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Carousel Controls - Only visible if multiple images exist */}
                {images.length > 1 && (
                    <>
                        {/* Prev Button - Visible on group hover */}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <button
                                onClick={prevImage}
                                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Next Button - Visible on group hover */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <button
                                onClick={nextImage}
                                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm",
                                        idx === currentImageIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="absolute top-3 right-3 z-10">
                    <Button
                        size="icon"
                        variant="secondary"
                        className={cn("h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors", isFav && "text-red-500 hover:text-red-600")}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(property.id)
                        }}
                    >
                        <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                    </Button>
                </div>

                {/* Tags are moved to stay visible but not interfere with dots if possible, 
                    or we can keep them but adjust position. 
                    Let's move them slightly up or keep as is but aware of overlap. 
                    Actually, let's put tags in top-left instead or just ensure z-index.
                */}
                <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                    {/* Hiding tags if they overlap with dots? Or move them top left? 
                        Let's move tags to top left for cleaner look with carousel. 
                    */}
                </div>
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {property?.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs font-medium bg-brand-dark/80 text-white backdrop-blur-md rounded-md">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="font-semibold text-lg tracking-tight group-hover:text-brand-gold transition-colors">
                        {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-border/50">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Proj. Yield</p>
                        <p className="font-semibold text-brand-gold">{property.projectedYield}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Min. Inv</p>
                        <p className="font-semibold">{property.minInvestment}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Funded</span>
                            <span className="font-medium">{property.funded || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold rounded-full" style={{ width: `${property.funded || 0}%` }} />
                        </div>
                    </div>
                </div>

                <Button asChild className="w-full" variant="outline">
                    <Link href={`/property/${property.id}`}>View Details</Link>
                </Button>
            </div>
        </div>
    )
}
