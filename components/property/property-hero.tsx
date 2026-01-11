"use client"

import { Property } from "@/data/properties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Heart, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useProperties } from "@/context/property-context"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PropertyHeroProps {
    property: Property
}

export function PropertyHero({ property }: PropertyHeroProps) {
    const { isFavorite, toggleFavorite } = useProperties()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const isFav = isFavorite(property.id)

    // Ensure we have an array of images, fallback to single image if needed
    const images = property.images && property.images.length > 0 ? property.images : [property.imageUrl]

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!", {
            icon: <Check className="h-4 w-4 text-brand-green" />,
            description: "You can now paste the url to share this property.",
        })
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-muted overflow-hidden group select-none">
            {/* Image Carousel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
                >
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Verified Badge */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-2 z-10">
                <Badge className="bg-brand-green text-black hover:bg-brand-green/90 border-0 text-sm px-3 py-1 font-bold">
                    Verified Asset
                </Badge>
            </div>

            {/* Navigation Controls - Only show if multiple images */}
            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 backdrop-blur-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 backdrop-blur-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex
                                    ? "bg-brand-gold w-8"
                                    : "bg-white/50 w-2 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Share & Favorite Buttons */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2 z-10">
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 hover:text-white"
                    onClick={handleShare}
                >
                    <Share2 className="h-5 w-5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-full backdrop-blur transition-all ${isFav ? "bg-white text-red-500 hover:bg-white/90" : "bg-black/20 text-white hover:bg-black/40 hover:text-white"}`}
                    onClick={() => toggleFavorite(property.id)}
                >
                    <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                </Button>
            </div>
        </div>
    )
}
