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
            const loadPropertiesWithMetadata = async () => {
                const contractProperties: Property[] = await Promise.all(
                    propertiesDetails.map(async (detail: any) => {
                        // Calculate expected monthly income from annual yield
                        const totalValue = Number(formatUnits(detail.totalValue, 6))
                        const expectedMonthlyIncome = Number(formatUnits(detail.expectedMonthlyIncome, 6))
                        const annualYield = totalValue > 0 ? (expectedMonthlyIncome * 12 / totalValue * 100) : 0

                        // Try to fetch metadata from IPFS if available
                        let imageUrl = `/dubai-downtown.png`
                        let description = `Property tokenized on BrickFi platform. Total value: $${totalValue.toLocaleString()}`
                        let tags = detail.isActive ? ["Active", "Blockchain"] : ["Inactive"]

                        if (detail.metadataURI && detail.metadataURI !== "") {
                            try {
                                // Convert ipfs:// to gateway URL
                                const gatewayURL = detail.metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                                const response = await fetch(gatewayURL)

                                if (response.ok) {
                                    const metadata = await response.json()

                                    // Use first image from metadata
                                    if (metadata.images && metadata.images.length > 0) {
                                        imageUrl = metadata.images[0].replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                                    }

                                    // Use description from metadata
                                    if (metadata.description) {
                                        description = metadata.description
                                    }

                                    // Add location as tag
                                    if (metadata.location) {
                                        tags = [...tags, metadata.location]
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to fetch metadata for property:', detail.propertyAddress, error)
                            }
                        }

                        return {
                            id: detail.propertyAddress,
                            title: detail.name,
                            location: detail.location,
                            imageUrl,
                            projectedYield: `${annualYield.toFixed(1)}%`,
                            minInvestment: "$50",
                            totalValue: `$${totalValue.toLocaleString()}`,
                            funded: Number(detail.fundingPercentage),
                            description,
                            tags,
                            tokenSymbol: detail.name.substring(0, 3).toUpperCase(),
                        }
                    })
                )

                setProperties(contractProperties)
                setIsLoading(false)
            }

            loadPropertiesWithMetadata()
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
