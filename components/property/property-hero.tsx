"use client"

import { Property } from "@/data/properties"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Heart, Box } from "lucide-react"
import { useState } from "react"
// import { VirtualTourViewer } from "./virtual-tour-viewer"

interface PropertyHeroProps {
    property: Property
}

export function PropertyHero({ property }: PropertyHeroProps) {
    const [show3D, setShow3D] = useState(false)

    return (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-muted overflow-hidden group">

            {/* {show3D && (
                <VirtualTourViewer onClose={() => setShow3D(false)} />
            )} */}

            {/* Simulation of 3D Viewer or High-Res Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${property.imageUrl})` }}
            >
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-2">
                <Badge className="bg-brand-green text-black hover:bg-brand-green/90 border-0 text-sm px-3 py-1 font-bold">
                    Verified Asset
                </Badge>
                <Badge variant="secondary" className="backdrop-blur-md bg-white/20 text-white border-white/20">
                    3D Tour Available
                </Badge>
            </div>

            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 hover:text-white">
                    <Share2 className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-black/20 backdrop-blur text-white hover:bg-black/40 hover:text-white">
                    <Heart className="h-5 w-5" />
                </Button>
            </div>

            {/* Temporarily disabled - Three.js dependencies not installed */}
            {/* <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
                <Button
                    variant="outline"
                    className="bg-black/40 backdrop-blur-md border-white/30 text-white hover:bg-brand-green hover:text-black hover:border-brand-green transition-all"
                    onClick={() => setShow3D(true)}
                >
                    <Box className="mr-2 h-4 w-4" /> View 3D Model
                </Button>
            </div> */}
        </div>
    )
}
