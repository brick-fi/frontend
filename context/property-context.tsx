"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { Property, PROPERTIES as initialProperties } from "@/data/properties"

interface PropertyContextType {
    properties: Property[]
    favorites: string[]
    addProperty: (property: Property) => void
    toggleFavorite: (id: string) => void
    isFavorite: (id: string) => boolean
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>(initialProperties)
    const [favorites, setFavorites] = useState<string[]>([])

    // Optional: Load from local storage on mount (client-side only)
    useEffect(() => {
        const savedFavs = localStorage.getItem("brickfi-favorites")
        if (savedFavs) {
            setFavorites(JSON.parse(savedFavs))
        }

        // We could also load added properties from local storage here if we wanted better persistence
    }, [])

    // Optional: Save favorites to local storage
    useEffect(() => {
        localStorage.setItem("brickfi-favorites", JSON.stringify(favorites))
    }, [favorites])

    const addProperty = (property: Property) => {
        setProperties((prev) => [property, ...prev])
    }

    const toggleFavorite = (id: string) => {
        setFavorites((prev) =>
            prev.includes(id)
                ? prev.filter((favId) => favId !== id)
                : [...prev, id]
        )
    }

    const isFavorite = (id: string) => favorites.includes(id)

    return (
        <PropertyContext.Provider value={{ properties, favorites, addProperty, toggleFavorite, isFavorite }}>
            {children}
        </PropertyContext.Provider>
    )
}

export function useProperties() {
    const context = useContext(PropertyContext)
    if (context === undefined) {
        throw new Error("useProperties must be used within a PropertyProvider")
    }
    return context
}
