"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { Property, PROPERTIES } from "@/data/properties"
import { usePropertyFactory } from "@/hooks/usePropertyFactory"
import { formatUnits } from "viem"
import { PropertyMetadata } from "@/types/metadata"

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
    const [properties, setProperties] = useState<Property[]>([])
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true) // Default to true while loading blockchain data

    const { propertiesDetails, refetchProperties } = usePropertyFactory()

    // Load contract properties when available
    useEffect(() => {
        if (propertiesDetails && Array.isArray(propertiesDetails) && propertiesDetails.length > 0) {
            const loadPropertiesWithMetadata = async () => {
                const contractProperties: Property[] = await Promise.all(
                    propertiesDetails.map(async (detail: any) => {
                        // Calculate expected monthly income from annual yield
                        const totalValue = Number(formatUnits(detail.totalValue, 6))
                        const expectedMonthlyIncome = Number(formatUnits(detail.expectedMonthlyIncome, 6))
                        const annualYield = totalValue > 0 ? (expectedMonthlyIncome * 12 / totalValue * 100) : 0

                        // Try to fetch metadata from IPFS if available
                        let imageUrl = `/dubai-downtown.png`
                        let images: string[] = []
                        let description = `Property tokenized on BrickFi platform. Total value: $${totalValue.toLocaleString()}`
                        let tags: string[] = detail.isActive ? ["Active"] : ["Inactive"]
                        let aiInsights = null

                        if (detail.metadataURI && detail.metadataURI !== "") {
                            try {
                                // Convert ipfs:// to gateway URL - use Pinata gateway for better performance
                                const gatewayURL = detail.metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                                const response = await fetch(gatewayURL, {
                                    mode: 'cors',
                                    headers: {
                                        'Accept': 'application/json'
                                    }
                                })

                                if (response.ok) {
                                    const metadata: PropertyMetadata = await response.json()

                                    // Convert all IPFS image URIs to gateway URLs using Pinata
                                    if (metadata.images && metadata.images.length > 0) {
                                        images = metadata.images.map(uri =>
                                            uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                                        )
                                        imageUrl = images[0] // First image as primary
                                    }

                                    // Use description from metadata
                                    if (metadata.description) {
                                        description = metadata.description
                                    }

                                    // Use tags from metadata
                                    if (metadata.tags && metadata.tags.length > 0) {
                                        tags = [...tags, ...metadata.tags]
                                    }

                                    // Get AI insights if available
                                    if (metadata.aiInsights) {
                                        aiInsights = metadata.aiInsights
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
                            images: images.length > 0 ? images : undefined, // Only include if we have images
                            projectedYield: `${annualYield.toFixed(1)}%`,
                            minInvestment: "$50",
                            totalValue: `$${totalValue.toLocaleString()}`,
                            funded: Number(detail.fundingPercentage),
                            investorCount: detail.investorCount ? Number(detail.investorCount) : 0,
                            description,
                            tags,
                            tokenSymbol: detail.name.substring(0, 3).toUpperCase(),
                            aiInsights, // Include AI insights from metadata
                        }
                    })
                )

                // Use only contract properties (no more static data)
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
