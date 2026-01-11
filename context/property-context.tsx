"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { Property, PROPERTIES as initialProperties } from "@/data/properties"
import { usePropertyFactory } from "@/hooks/usePropertyFactory"
import { formatUnits } from "viem"

interface PropertyContextType {
    properties: Property[]
    favorites: string[]
    isLoading: boolean
    addProperty: (property: Property) => void
    toggleFavorite: (id: string) => void
    isFavorite: (id: string) => boolean
    refetchProperties: () => void
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<Property[]>(initialProperties)
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const { propertiesDetails, refetchProperties } = usePropertyFactory()

    // Load contract properties when available
    useEffect(() => {
        if (propertiesDetails && Array.isArray(propertiesDetails)) {
            const contractProperties: Property[] = propertiesDetails.map((detail: any, index: number) => {
                // Calculate expected monthly income from annual yield
                const totalValue = Number(formatUnits(detail.totalValue, 6))
                const expectedMonthlyIncome = Number(formatUnits(detail.expectedMonthlyIncome, 6))
                const annualYield = totalValue > 0 ? (expectedMonthlyIncome * 12 / totalValue * 100) : 0

                return {
                    id: detail.propertyAddress,
                    title: detail.name,
                    location: detail.location,
                    imageUrl: detail.metadataURI || `/dubai-downtown.png`,
                    projectedYield: `${annualYield.toFixed(1)}%`,
                    minInvestment: "$50",
                    totalValue: `$${totalValue.toLocaleString()}`,
                    funded: Number(detail.fundingPercentage),
                    description: `Property tokenized on BrickFi platform. Total value: $${totalValue.toLocaleString()}`,
                    tags: detail.isActive ? ["Active", "Blockchain"] : ["Inactive"],
                    tokenSymbol: detail.name.substring(0, 3).toUpperCase(),
                }
            })

            setProperties(contractProperties)
            setIsLoading(false)
        }
    }, [propertiesDetails])

    // Load from local storage on mount (client-side only)
    useEffect(() => {
        const savedFavs = localStorage.getItem("brickfi-favorites")
        if (savedFavs) {
            setFavorites(JSON.parse(savedFavs))
        }
    }, [])

    // Save favorites to local storage
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
        <PropertyContext.Provider value={{ properties, favorites, isLoading, addProperty, toggleFavorite, isFavorite, refetchProperties }}>
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
